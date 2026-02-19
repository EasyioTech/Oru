
import { db } from '../../../infrastructure/database/index.js';
import { agencies, users, systemHealthMetrics, profiles, tickets, userSessions } from '../../../infrastructure/database/schema.js';
import { eq, sql, desc, count, isNotNull, and } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { TicketsQueryInput } from '../schemas.js';

export class SystemMonitoringService {
    constructor(private readonly app: FastifyInstance) { }

    async getMetrics() {
        const [totalAgenciesResult] = await db.select({ count: count() }).from(agencies);
        const [activeAgenciesResult] = await db.select({ count: count() }).from(agencies).where(eq(agencies.isActive, true));
        const [totalUsersResult] = await db.select({ count: count() }).from(users);
        const [activeUsersResult] = await db.select({ count: count() }).from(users).where(eq(users.status, 'active'));

        const plansResult = await db.select({ plan: agencies.subscriptionPlan, count: count() }).from(agencies).groupBy(agencies.subscriptionPlan);
        const subscriptionPlans: Record<string, number> = { basic: 0, pro: 0, enterprise: 0 };
        plansResult.forEach(row => { if (row.plan) subscriptionPlans[row.plan] = row.count; });

        const [latestHealth] = await db.select().from(systemHealthMetrics).orderBy(desc(systemHealthMetrics.timestamp)).limit(1);
        const agenciesList = await db.select().from(agencies).orderBy(desc(agencies.createdAt)).limit(50);
        const usersPerAgency = await db.select({ agencyId: profiles.agencyId, count: count() }).from(profiles).where(isNotNull(profiles.agencyId)).groupBy(profiles.agencyId);
        const agencyUserMap = new Map(usersPerAgency.map(row => [row.agencyId as string, row.count]));

        return {
            metrics: {
                totalAgencies: totalAgenciesResult.count,
                activeAgencies: activeAgenciesResult.count,
                totalUsers: totalUsersResult.count,
                activeUsers: activeUsersResult.count,
                subscriptionPlans,
                systemHealth: {
                    uptime: `${latestHealth?.systemUptimeSeconds || 0}s`,
                    responseTime: latestHealth?.apiResponseTimeAvgMs || 0,
                    errorRate: Number(latestHealth?.apiErrorRatePercent || 0),
                },
            },
            agencies: agenciesList.map(agency => ({
                ...agency,
                userCount: agencyUserMap.get(agency.id) || 0,
            })),
        };
    }

    async getRealtimeUsage() {
        const now = new Date();
        const [sessionCount] = await db.select({ count: count() }).from(userSessions).where(and(eq(userSessions.isActive, true), sql`${userSessions.expiresAt} > ${now}`));
        return { activeUsers: 0, activeSessions: sessionCount.count, requestsPerSecond: 0, timestamp: new Date().toISOString() };
    }

    async getTickets(params?: TicketsQueryInput) {
        const limit = params?.limit || 100;
        const offset = params?.offset || 0;
        const conditions = [];
        if (params?.status) conditions.push(eq(tickets.status, params.status));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const ticketsList = await db.select().from(tickets).where(whereClause).orderBy(desc(tickets.createdAt)).limit(limit).offset(offset);
        return { tickets: ticketsList };
    }
}
