import { db } from '../../../infrastructure/database/index.js';
import { agencies, profiles, projects, clients, users, agencySettings } from '../../../infrastructure/database/schema.js';
import { eq, and, count, isNull, gte } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError } from '../../../utils/errors.js';

export class AgencySettingsService {
    constructor(private logger: FastifyBaseLogger) {}

    async getDashboardMetrics(agencyId: string) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            agencyRows,
            totalUsersResult,
            activeUsersResult,
            totalProjectsResult,
            activeProjectsResult,
            totalClientsResult,
            recentUsersResult,
            recentProjectsResult,
        ] = await Promise.all([
            db.select().from(agencies).where(eq(agencies.id, agencyId)).limit(1),
            db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), isNull(profiles.deletedAt))),
            db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), eq(profiles.isActive, true), isNull(profiles.deletedAt))),
            db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), isNull(projects.deletedAt))),
            db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), eq(projects.status, 'active'), isNull(projects.deletedAt))),
            db.select({ count: count() }).from(clients).where(and(eq(clients.agencyId, agencyId), isNull(clients.deletedAt))),
            db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), gte(profiles.createdAt, thirtyDaysAgo), isNull(profiles.deletedAt))),
            db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), gte(projects.createdAt, thirtyDaysAgo), isNull(projects.deletedAt))),
        ]);

        const agency = agencyRows[0] ?? null;

        return {
            agency: agency ? {
                id: agency.id,
                name: agency.name,
                domain: agency.domain,
                status: agency.status,
                subscriptionPlan: agency.subscriptionPlan,
                isActive: agency.isActive,
                maxUsers: agency.maxUsers,
                trialEndsAt: agency.trialEndsAt ?? null,
                subscriptionEndsAt: agency.subscriptionEndsAt ?? null,
            } : null,
            metrics: {
                totalUsers: totalUsersResult[0].count,
                activeUsers: activeUsersResult[0].count,
                totalProjects: totalProjectsResult[0].count,
                activeProjects: activeProjectsResult[0].count,
                totalClients: totalClientsResult[0].count,
                totalInvoices: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                attendanceRecords: 0,
                leaveRequests: { pending: 0, approved: 0, total: 0 },
                recentActivity: {
                    newUsers: recentUsersResult[0].count,
                    newProjects: recentProjectsResult[0].count,
                    newInvoices: 0,
                },
            },
        };
    }

    async getAgencyUsers(agencyId: string) {
        return db.select({
            id: profiles.id,
            email: users.email,
            full_name: profiles.fullName,
            is_active: profiles.isActive,
            created_at: profiles.createdAt,
        })
        .from(profiles)
        .innerJoin(users, eq(profiles.userId, users.id))
        .where(eq(profiles.agencyId, agencyId));
    }

    async getAgencyUsage(agencyId: string) {
        const [usersCount] = await db.select({ count: count() }).from(profiles).where(eq(profiles.agencyId, agencyId));
        const [projectsCount] = await db.select({ count: count() }).from(projects).where(eq(projects.agencyId, agencyId));
        const [clientsCount] = await db.select({ count: count() }).from(clients).where(eq(clients.agencyId, agencyId));

        return {
            users: usersCount?.count || 0,
            projects: projectsCount?.count || 0,
            invoices: 0,
            clients: clientsCount?.count || 0,
            tasks: 0,
        };
    }

    async getAgencySettings(agencyId: string) {
        try {
            const [settings] = await db.select().from(agencySettings).where(eq(agencySettings.agencyId, agencyId)).limit(1);
            return settings || {};
        } catch (err: any) {
            if (err.code === '42P01') return {};
            throw err;
        }
    }

    async updateAgencySettings(agencyId: string, settings: any) {
        let result;
        if (settings.id) {
            [result] = await db.update(agencySettings)
                .set({ ...settings, updatedAt: new Date() })
                .where(eq(agencySettings.id, settings.id))
                .returning();
        } else {
            const [existing] = await db.select().from(agencySettings).where(eq(agencySettings.agencyId, agencyId)).limit(1);
            if (existing) {
                [result] = await db.update(agencySettings)
                    .set({ ...settings, updatedAt: new Date() })
                    .where(eq(agencySettings.id, existing.id))
                    .returning();
            } else {
                [result] = await db.insert(agencySettings)
                    .values({ ...settings, agencyId, agencyName: settings.agencyName || 'Agency' })
                    .returning();
            }
        }
        return result;
    }
}
