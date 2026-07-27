import { agencies, users, systemHealthMetrics, profiles, tickets, userSessions, projects, clients } from '../../../infrastructure/database/schema.js';
import { eq, sql, desc, count, isNotNull, and, sum, gte } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { TicketsQueryInput } from '../schemas.js';
import { redisConnection } from '../../../infrastructure/redis/index.js';
import os from 'os';

export interface ServiceHealthStatus {
    status: 'up' | 'down';
    latency: number;
}

export interface DetailedHealthResult {
    postgres: ServiceHealthStatus;
    redis: ServiceHealthStatus;
    system: {
        uptime: number;
        memory: {
            total: number;
            free: number;
            usagePercent: number;
        };
    };
}

export class SystemMonitoringService {
    constructor(private db: NodePgDatabase<any>) { }

    async checkDetailedHealth() {
        const start = Date.now();
        const results: DetailedHealthResult = {
            postgres: { status: 'down', latency: 0 },
            redis: { status: 'down', latency: 0 },
            system: {
                uptime: os.uptime(),
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
                }
            }
        };

        // 1. Check Postgres (Father DB)
        try {
            const pgStart = Date.now();
            await this.db.execute(sql`SELECT 1`);
            results.postgres.status = 'up';
            results.postgres.latency = Date.now() - pgStart;
        } catch (error) {
            console.error({ error, context: 'health-check-postgres' });
        }

        // 2. Check Redis
        try {
            const redisStart = Date.now();
            await redisConnection.ping();
            results.redis.status = 'up';
            results.redis.latency = Date.now() - redisStart;
        } catch (error) {
            console.error({ error, context: 'health-check-redis' });
        }

        return {
            status: results.postgres.status === 'up' && results.redis.status === 'up' ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            totalLatency: Date.now() - start,
            details: results
        };
    }

    async checkSignupPreflight() {
        const health = await this.checkDetailedHealth();

        // Critical requirement: Postgres must be up for signup
        if (health.details.postgres.status !== 'up') {
            return {
                allowed: false,
                reason: 'DATABASE_UNREACHABLE',
                message: 'The central database is currently unreachable. Please try again later.'
            };
        }

        // Check if database creation is possible (Permission check)
        try {
            // We don't actually create a DB, but check if we can list databases as a proxy for permission
            await this.db.execute(sql`SELECT datname FROM pg_database LIMIT 1`);
        } catch (error: unknown) {
            console.error({ error, context: 'signup-preflight-permission' });
            return {
                allowed: false,
                reason: 'INSUFFICIENT_PERMISSIONS',
                message: 'Database provisioning permissions are not correctly configured.'
            };
        }

        return {
            allowed: true,
            status: health.status,
            postgresLatency: health.details.postgres.latency
        };
    }

    async getMetrics() {
        const [totalAgenciesResult] = await this.db.select({ count: count() }).from(agencies);
        const [activeAgenciesResult] = await this.db.select({ count: count() }).from(agencies).where(eq(agencies.isActive, true));
        const [totalUsersResult] = await this.db.select({ count: count() }).from(users);
        const [activeUsersResult] = await this.db.select({ count: count() }).from(users).where(eq(users.status, 'active'));

        const [totalProjectsResult] = await this.db.select({ count: count() }).from(projects);
        const [totalClientsResult] = await this.db.select({ count: count() }).from(clients);

        const plansResult = await this.db.select({ plan: agencies.subscriptionPlan, count: count() }).from(agencies).groupBy(agencies.subscriptionPlan);
        const subscriptionPlans: Record<string, number> = { basic: 0, pro: 0, enterprise: 0 };
        plansResult.forEach(row => { if (row.plan) subscriptionPlans[row.plan] = row.count; });

        const [latestHealth] = await this.db.select().from(systemHealthMetrics).orderBy(desc(systemHealthMetrics.timestamp)).limit(1);
        const agenciesList = await this.db.select().from(agencies).orderBy(desc(agencies.createdAt)).limit(50);
        
        const usersPerAgency = await this.db.select({ agencyId: profiles.agencyId, count: count() }).from(profiles).where(isNotNull(profiles.agencyId)).groupBy(profiles.agencyId);
        const agencyUserMap = new Map(usersPerAgency.map(row => [row.agencyId as string, row.count]));

        const projectsPerAgency = await this.db.select({ agencyId: projects.agencyId, count: count() }).from(projects).groupBy(projects.agencyId);
        const agencyProjectMap = new Map(projectsPerAgency.map(row => [row.agencyId as string, row.count]));

        return {
            metrics: {
                totalAgencies: totalAgenciesResult.count,
                activeAgencies: activeAgenciesResult.count,
                totalUsers: totalUsersResult.count,
                activeUsers: activeUsersResult.count,
                subscriptionPlans,
                // Revenue metrics: placeholders until billing module is implemented
                revenueMetrics: {
                    mrr: 0,
                    arr: 0,
                },
                // Usage stats: cross-tenant aggregation (invoices & attendance pending implementation)
                usageStats: {
                    totalProjects: totalProjectsResult.count,
                    totalInvoices: 0,
                    totalClients: totalClientsResult.count,
                    totalAttendanceRecords: 0,
                },
                systemHealth: {
                    uptime: `${latestHealth?.systemUptimeSeconds || 0}s`,
                    responseTime: latestHealth?.apiResponseTimeAvgMs || 0,
                    errorRate: Number(latestHealth?.apiErrorRatePercent || 0),
                },
            },
            // Return agencies with snake_case fields matching AgencySummary frontend type
            agencies: agenciesList.map(agency => ({
                id: agency.id,
                name: agency.name,
                domain: agency.domain,
                subscription_plan: agency.subscriptionPlan ?? 'basic',
                max_users: agency.maxUsers ?? 10,
                is_active: agency.isActive ?? false,
                created_at: agency.createdAt?.toISOString() ?? new Date().toISOString(),
                user_count: agencyUserMap.get(agency.id) ?? 0,
                project_count: agencyProjectMap.get(agency.id) ?? 0,
                invoice_count: 0,
            })),
        };
    }

    async getRealtimeUsage() {
        const now = new Date();
        const [sessionCount] = await this.db
            .select({ count: count() })
            .from(userSessions)
            .where(and(eq(userSessions.isActive, true), sql`${userSessions.expiresAt} > ${now}`));

        const [distinctUserCount] = await this.db
            .select({ count: sql<number>`COUNT(DISTINCT ${userSessions.userId})` })
            .from(userSessions)
            .where(and(eq(userSessions.isActive, true), sql`${userSessions.expiresAt} > ${now}`));

        return {
            activeUsers: Number(distinctUserCount?.count ?? 0),
            activeSessions: sessionCount.count,
            requestsPerSecond: 0,
            timestamp: new Date().toISOString(),
        };
    }

    async getTickets(params?: TicketsQueryInput) {
        const limit = params?.limit || 100;
        const offset = params?.offset || 0;
        const conditions = [];
        if (params?.status) conditions.push(eq(tickets.status, params.status));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const ticketsList = await this.db.select().from(tickets).where(whereClause).orderBy(desc(tickets.createdAt)).limit(limit).offset(offset);
        return { tickets: ticketsList };
    }

    async getTicketsSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalResult] = await this.db.select({ count: count() }).from(tickets);
        const [openResult] = await this.db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'open'));
        const [inProgressResult] = await this.db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'in_progress'));
        const [resolvedResult] = await this.db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'resolved'));
        const [newTodayResult] = await this.db.select({ count: count() }).from(tickets).where(gte(tickets.createdAt, today));
        const [resolvedTodayResult] = await this.db.select({ count: count() }).from(tickets).where(and(eq(tickets.status, 'resolved'), gte(tickets.updatedAt, today)));

        const recentTickets = await this.db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(10);

        return {
            stats: {
                total: totalResult.count,
                open: openResult.count,
                inProgress: inProgressResult.count,
                resolved: resolvedResult.count,
                avgResolutionTime: 0,
                newToday: newTodayResult.count,
                resolvedToday: resolvedTodayResult.count,
            },
            recentTickets,
        };
    }
}
