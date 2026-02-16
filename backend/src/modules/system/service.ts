
import { db } from '../../infrastructure/database/index.js';
import { systemSettings, agencies, users, systemHealthMetrics, profiles, tickets, systemFeatures } from '../../infrastructure/database/schema.js';
import { eq, sql, desc, count, isNotNull, and } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { AppError, NotFoundError } from '../../utils/errors.js';

export class SystemService {
    constructor(private readonly app: FastifyInstance) { }

    async getMetrics() {
        // Agencies Counts
        const [totalAgenciesResult] = await db.select({ count: count() }).from(agencies);
        const [activeAgenciesResult] = await db.select({ count: count() }).from(agencies).where(eq(agencies.isActive, true));

        // Users Counts
        const [totalUsersResult] = await db.select({ count: count() }).from(users);
        const [activeUsersResult] = await db.select({ count: count() }).from(users).where(eq(users.status, 'active'));

        // Subscription Plans Breakdown
        const plansResult = await db
            .select({
                plan: agencies.subscriptionPlan,
                count: count(),
            })
            .from(agencies)
            .groupBy(agencies.subscriptionPlan);

        const subscriptionPlans: Record<string, number> = {
            basic: 0,
            pro: 0,
            enterprise: 0,
        };

        plansResult.forEach(row => {
            if (row.plan) subscriptionPlans[row.plan] = row.count;
        });

        // System Health (Latest)
        const [latestHealth] = await db
            .select()
            .from(systemHealthMetrics)
            .orderBy(desc(systemHealthMetrics.timestamp))
            .limit(1);

        // Fetch Agencies for the list
        const agenciesList = await db.select().from(agencies).orderBy(desc(agencies.createdAt)).limit(50);

        // Counts users per agency from central profiles table
        const usersPerAgency = await db
            .select({
                agencyId: profiles.agencyId,
                count: count(),
            })
            .from(profiles)
            .where(isNotNull(profiles.agencyId))
            .groupBy(profiles.agencyId);

        const agencyUserMap = new Map(usersPerAgency.map(row => [row.agencyId as string, row.count]));

        // Map to shape expected by schema input
        const formattedAgencies = agenciesList.map(agency => ({
            ...agency,
            userCount: agencyUserMap.get(agency.id) || 0,
            projectCount: 0,
            invoiceCount: 0,
        }));

        // Mock revenue/usage
        const revenueMetrics = {
            mrr: 0,
            arr: 0,
        };

        const usageStats = {
            totalProjects: 0,
            totalInvoices: 0,
            totalClients: 0,
            totalAttendanceRecords: 0,
        };

        return {
            metrics: {
                totalAgencies: totalAgenciesResult.count,
                activeAgencies: activeAgenciesResult.count,
                totalUsers: totalUsersResult.count,
                activeUsers: activeUsersResult.count,
                subscriptionPlans,
                revenueMetrics,
                usageStats,
                systemHealth: {
                    uptime: `${latestHealth?.systemUptimeSeconds || 0}s`,
                    responseTime: latestHealth?.apiResponseTimeAvgMs || 0,
                    errorRate: Number(latestHealth?.apiErrorRatePercent || 0),
                },
            },
            agencies: formattedAgencies,
        };
    }

    async getSettings() {
        let [settings] = await db.select().from(systemSettings).limit(1);

        if (!settings) {
            const [newSettings] = await db.insert(systemSettings).values({
                systemName: 'BuildFlow ERP',
            }).returning();
            settings = newSettings;
        }

        return settings;
    }

    async updateSettings(updates: any) {
        try {
            // Validate that updates is an object
            if (!updates || typeof updates !== 'object') {
                throw new Error('Invalid settings data');
            }

            // Remove any undefined or null values
            const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            // If no valid updates, return current settings
            if (Object.keys(cleanUpdates).length === 0) {
                return await this.getSettings();
            }

            let settings = await this.getSettings();

            const [updatedSettings] = await db.update(systemSettings)
                .set({
                    ...cleanUpdates,
                    updatedAt: new Date()
                })
                .where(eq(systemSettings.id, settings.id))
                .returning();

            return updatedSettings || settings;
        } catch (error) {
            this.app.log.error({ error, context: 'updateSettings', updates });
            // Return current settings on error
            return await this.getSettings();
        }
    }

    async getMaintenanceStatus() {
        const settings = await this.getSettings();
        return {
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            startTime: settings.maintenanceStartTime,
            endTime: settings.maintenanceEndTime,
        };
    }

    async getBranding() {
        const settings = await this.getSettings();
        return {
            systemName: settings.systemName,
            systemTagline: settings.systemTagline,
            logoUrl: settings.logoUrl,
            logoLightUrl: settings.logoLightUrl,
            logoDarkUrl: settings.logoDarkUrl,
            faviconUrl: settings.faviconUrl,
        };
    }

    async getRealtimeUsage() {
        // This would normally come from Redis/Websockets
        return {
            activeUsers: Math.floor(Math.random() * 50),
            activeSessions: Math.floor(Math.random() * 100),
            requestsPerSecond: Math.floor(Math.random() * 20),
            timestamp: new Date().toISOString(),
        };
    }

    async getTickets(params?: { status?: string; priority?: string; limit?: number; offset?: number }) {
        try {
            const limit = params?.limit || 100;
            const offset = params?.offset || 0;

            const conditions = [];
            if (params?.status) {
                conditions.push(eq(tickets.status, params.status));
            }
            if (params?.priority) {
                conditions.push(eq(tickets.priority, params.priority));
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

            const ticketsList = await db
                .select()
                .from(tickets)
                .where(whereClause)
                .orderBy(desc(tickets.createdAt))
                .limit(limit)
                .offset(offset);

            return { tickets: ticketsList };
        } catch (error) {
            this.app.log.error({ error, context: 'getTickets' });
            // Return empty array on error to prevent dashboard crash
            return { tickets: [] };
        }
    }

    async getTicketsSummary() {
        try {
            const [totalResult] = await db.select({ count: count() }).from(tickets);
            const [openResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'open'));
            const [inProgressResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'in_progress'));
            const [resolvedResult] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'resolved'));

            // Get recent tickets (last 5)
            const recentTickets = await db
                .select({
                    id: tickets.id,
                    ticketNumber: tickets.ticketNumber,
                    title: tickets.title,
                    status: tickets.status,
                    priority: tickets.priority,
                    category: tickets.category,
                    createdAt: tickets.createdAt,
                })
                .from(tickets)
                .orderBy(desc(tickets.createdAt))
                .limit(5);

            // Calculate today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [newTodayResult] = await db
                .select({ count: count() })
                .from(tickets)
                .where(sql`${tickets.createdAt} >= ${today}`);

            const [resolvedTodayResult] = await db
                .select({ count: count() })
                .from(tickets)
                .where(and(
                    eq(tickets.status, 'resolved'),
                    sql`${tickets.resolvedAt} >= ${today}`
                ));

            return {
                stats: {
                    total: totalResult.count,
                    open: openResult.count,
                    inProgress: inProgressResult.count,
                    resolved: resolvedResult.count,
                    avgResolutionTime: 0, // TODO: Calculate actual average
                    newToday: newTodayResult.count,
                    resolvedToday: resolvedTodayResult.count,
                },
                recentTickets,
            };
        } catch (error) {
            this.app.log.error({ error, context: 'getTicketsSummary' });
            // Return safe defaults on error to prevent dashboard crash
            return {
                stats: {
                    total: 0,
                    open: 0,
                    inProgress: 0,
                    resolved: 0,
                    avgResolutionTime: 0,
                    newToday: 0,
                    resolvedToday: 0,
                },
                recentTickets: [],
            };
        }
    }

    async getSystemFeatures() {
        try {
            const featuresList = await db.select().from(systemFeatures).where(eq(systemFeatures.isActive, true));
            return {
                features: featuresList,
                enabledModules: [
                    'agencies',
                    'users',
                    'plans',
                    'catalog',
                    'monitoring',
                    'database',
                ],
            };
        } catch (error) {
            this.app.log.error({ error, context: 'getSystemFeatures' });
            return { features: [], enabledModules: [] };
        }
    }

    async createFeature(input: any) {
        try {
            const [feature] = await db.insert(systemFeatures).values({
                ...input,
            }).returning();
            return feature;
        } catch (error) {
            this.app.log.error({ error, context: 'createFeature', input });
            throw new AppError('Failed to create system feature');
        }
    }

    async updateFeature(id: string, input: any) {
        try {
            const [feature] = await db.update(systemFeatures)
                .set({ ...input, updatedAt: new Date() })
                .where(eq(systemFeatures.id, id))
                .returning();
            if (!feature) throw new NotFoundError('Feature not found');
            return feature;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.app.log.error({ error, context: 'updateFeature', id, input });
            throw new AppError('Failed to update system feature');
        }
    }

    async deleteFeature(id: string) {
        try {
            const [feature] = await db.update(systemFeatures)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(systemFeatures.id, id))
                .returning();
            if (!feature) throw new NotFoundError('Feature not found');
            return feature;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.app.log.error({ error, context: 'deleteFeature', id });
            throw new AppError('Failed to deactivate system feature');
        }
    }
}

