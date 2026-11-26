import { db } from '../../../infrastructure/database/index.js';
import {
  agencies,
  profiles,
  projects,
  clients,
  agencySettings,
} from '../../../infrastructure/database/schema.js';
import { eq, and, count, isNull, gte } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError } from '../../../utils/errors.js';

export class BusinessSettingsService {
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
      agency: agency
        ? {
            id: agency.id,
            name: agency.name,
            domain: agency.domain,
            status: agency.status,
            subscriptionPlan: agency.subscriptionPlan,
            isActive: agency.isActive,
            maxUsers: agency.maxUsers,
            trialEndsAt: agency.trialEndsAt ?? null,
            subscriptionEndsAt: agency.subscriptionEndsAt ?? null,
          }
        : null,
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
        },
      },
    };
  }

  async getAgencyUsers(agencyId: string) {
    try {
      const rows = await db
        .select()
        .from(profiles)
        .where(and(eq(profiles.agencyId, agencyId), isNull(profiles.deletedAt)));
      return rows;
    } catch (error) {
      this.logger.error({ error, context: 'getAgencyUsers', agencyId });
      throw new AppError('Failed to fetch agency users');
    }
  }

  async getAgencyUsage(agencyId: string) {
    try {
      const [agency] = await db
        .select()
        .from(agencies)
        .where(eq(agencies.id, agencyId));
      return {
        users: { used: 1, limit: agency?.maxUsers || 50 },
        storage: { usedGB: 0.1, limitGB: agency?.maxStorageGB || 10 },
      };
    } catch (error) {
      this.logger.error({ error, context: 'getAgencyUsage', agencyId });
      throw new AppError('Failed to fetch agency usage');
    }
  }

  async getAgencySettings(agencyId: string) {
    try {
      const [settings] = await db
        .select()
        .from(agencySettings)
        .where(eq(agencySettings.agencyId, agencyId));
      return settings || null;
    } catch (error) {
      this.logger.error({ error, context: 'getAgencySettings', agencyId });
      throw new AppError('Failed to fetch agency settings');
    }
  }

  async updateAgencySettings(agencyId: string, input: any) {
    try {
      const existing = await this.getAgencySettings(agencyId);
      if (existing) {
        const [updated] = await db
          .update(agencySettings)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(agencySettings.agencyId, agencyId))
          .returning();
        return updated;
      } else {
        const [created] = await db
          .insert(agencySettings)
          .values({ agencyId, ...input })
          .returning();
        return created;
      }
    } catch (error) {
      this.logger.error({ error, context: 'updateAgencySettings', agencyId, input });
      throw new AppError('Failed to update agency settings');
    }
  }
}
