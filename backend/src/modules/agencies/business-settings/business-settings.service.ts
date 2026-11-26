import { db } from '../../../infrastructure/database/index.js';
import {
  agencies,
  profiles,
  projects,
  clients,
  agencySettings,
  leaveRequests,
  employees,
} from '../../../infrastructure/database/schema.js';
import { eq, and, count, isNull, gte, desc } from 'drizzle-orm';
import { FastifyBaseLogger } from 'fastify';
import { AppError } from '../../../utils/errors.js';
import { mapToCamelCase } from '../../../utils/case-transform.js';

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
      totalEmployeesResult,
      activeEmployeesResult,
      pendingLeavesResult,
      approvedLeavesResult,
      totalLeavesResult,
      settingsRows,
      recentProjectsList,
      recentEmployeesList,
    ] = await Promise.all([
      db.select().from(agencies).where(eq(agencies.id, agencyId)).limit(1),
      db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), isNull(profiles.deletedAt))),
      db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), eq(profiles.isActive, true), isNull(profiles.deletedAt))),
      db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), isNull(projects.deletedAt))),
      db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), eq(projects.status, 'active'), isNull(projects.deletedAt))),
      db.select({ count: count() }).from(clients).where(and(eq(clients.agencyId, agencyId), isNull(clients.deletedAt))),
      db.select({ count: count() }).from(profiles).where(and(eq(profiles.agencyId, agencyId), gte(profiles.createdAt, thirtyDaysAgo), isNull(profiles.deletedAt))),
      db.select({ count: count() }).from(projects).where(and(eq(projects.agencyId, agencyId), gte(projects.createdAt, thirtyDaysAgo), isNull(projects.deletedAt))),
      db.select({ count: count() }).from(employees).where(and(eq(employees.agencyId, agencyId), isNull(employees.deletedAt))),
      db.select({ count: count() }).from(employees).where(and(eq(employees.agencyId, agencyId), eq(employees.status, 'active'), isNull(employees.deletedAt))),
      db.select({ count: count() }).from(leaveRequests).where(and(eq(leaveRequests.agencyId, agencyId), eq(leaveRequests.status, 'pending'), isNull(leaveRequests.deletedAt))),
      db.select({ count: count() }).from(leaveRequests).where(and(eq(leaveRequests.agencyId, agencyId), eq(leaveRequests.status, 'approved'), isNull(leaveRequests.deletedAt))),
      db.select({ count: count() }).from(leaveRequests).where(and(eq(leaveRequests.agencyId, agencyId), isNull(leaveRequests.deletedAt))),
      db.select().from(agencySettings).where(eq(agencySettings.agencyId, agencyId)).limit(1),
      db.select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        createdAt: projects.createdAt,
      }).from(projects).where(and(eq(projects.agencyId, agencyId), isNull(projects.deletedAt))).orderBy(desc(projects.createdAt)).limit(5),
      db.select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        position: employees.position,
        createdAt: employees.createdAt,
      }).from(employees).where(and(eq(employees.agencyId, agencyId), isNull(employees.deletedAt))).orderBy(desc(employees.createdAt)).limit(5),
    ]);

    const agency = agencyRows[0] ?? null;
    const settings = settingsRows[0] ?? null;

    const realActivities = [
      ...recentProjectsList.map((p) => ({
        id: p.id,
        title: p.name,
        type: 'project' as const,
        description: `Project · ${p.status ? p.status.toUpperCase() : 'ACTIVE'}`,
        timestamp: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        status: p.status || 'Active',
      })),
      ...recentEmployeesList.map((e) => ({
        id: e.id,
        title: `${e.firstName} ${e.lastName}`,
        type: 'employee' as const,
        description: e.position ? `Role: ${e.position}` : 'New team member',
        timestamp: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
        status: 'Active',
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

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
            logoUrl: settings?.logoUrl ?? (agency?.settings as any)?.logoUrl ?? null,
            logo_url: settings?.logoUrl ?? (agency?.settings as any)?.logoUrl ?? null,
          }
        : null,
      metrics: {
        totalUsers: (totalUsersResult[0]?.count ?? 0) || (totalEmployeesResult[0]?.count ?? 0),
        activeUsers: (activeUsersResult[0]?.count ?? 0) || (activeEmployeesResult[0]?.count ?? 0),
        totalProjects: totalProjectsResult[0]?.count ?? 0,
        activeProjects: activeProjectsResult[0]?.count ?? 0,
        totalClients: totalClientsResult[0]?.count ?? 0,
        totalInvoices: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        attendanceRecords: 0,
        leaveRequests: {
          pending: pendingLeavesResult[0]?.count ?? 0,
          approved: approvedLeavesResult[0]?.count ?? 0,
          total: totalLeavesResult[0]?.count ?? 0,
        },
        recentActivity: {
          newUsers: recentUsersResult[0]?.count ?? 0,
          newProjects: recentProjectsResult[0]?.count ?? 0,
        },
        recentActivities: realActivities,
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
      const camel = mapToCamelCase(input || {});
      const existing = await this.getAgencySettings(agencyId);

      // Sanitize fields
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (camel.agencyName !== undefined) updateData.agencyName = String(camel.agencyName).trim();
      if (camel.logoUrl !== undefined) updateData.logoUrl = camel.logoUrl ? String(camel.logoUrl).trim() : null;
      if (camel.domain !== undefined) updateData.domain = camel.domain ? String(camel.domain).trim() : null;
      if (camel.defaultCurrencyId !== undefined) updateData.defaultCurrencyId = camel.defaultCurrencyId;
      if (camel.primaryColor !== undefined) updateData.primaryColor = camel.primaryColor;
      if (camel.secondaryColor !== undefined) updateData.secondaryColor = camel.secondaryColor;
      if (camel.timezone !== undefined) updateData.timezone = camel.timezone || 'Asia/Kolkata';
      if (camel.dateFormat !== undefined) updateData.dateFormat = camel.dateFormat || 'DD/MM/YYYY';
      if (camel.fiscalYearStart !== undefined) updateData.fiscalYearStart = camel.fiscalYearStart || '04-01';
      if (camel.workingHoursStart !== undefined) updateData.workingHoursStart = camel.workingHoursStart;
      if (camel.workingHoursEnd !== undefined) updateData.workingHoursEnd = camel.workingHoursEnd;
      if (camel.workingDays !== undefined) {
        updateData.workingDays = Array.isArray(camel.workingDays)
          ? camel.workingDays
          : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      }
      if (camel.address !== undefined) updateData.address = camel.address;
      if (camel.city !== undefined) updateData.city = camel.city;
      if (camel.state !== undefined) updateData.state = camel.state;
      if (camel.postalCode !== undefined) updateData.postalCode = camel.postalCode;
      if (camel.country !== undefined) updateData.country = camel.country || 'India';

      let resultSettings;
      if (existing) {
        const [updated] = await db
          .update(agencySettings)
          .set(updateData)
          .where(eq(agencySettings.agencyId, agencyId))
          .returning();
        resultSettings = updated;
      } else {
        const [created] = await db
          .insert(agencySettings)
          .values({
            agencyId,
            agencyName: updateData.agencyName || 'My Agency',
            timezone: 'Asia/Kolkata',
            dateFormat: 'DD/MM/YYYY',
            fiscalYearStart: '04-01',
            country: 'India',
            ...updateData,
          })
          .returning();
        resultSettings = created;
      }

      // Also synchronize master agency row for consistent business profile
      const masterAgencyUpdates: Record<string, any> = { updatedAt: new Date() };
      if (updateData.agencyName) masterAgencyUpdates.name = updateData.agencyName;
      if (updateData.logoUrl !== undefined) masterAgencyUpdates.settings = { logoUrl: updateData.logoUrl };
      if (updateData.domain) masterAgencyUpdates.domain = updateData.domain;
      if (updateData.address !== undefined) masterAgencyUpdates.address = updateData.address;
      if (updateData.city !== undefined) masterAgencyUpdates.city = updateData.city;
      if (updateData.state !== undefined) masterAgencyUpdates.state = updateData.state;
      if (updateData.postalCode !== undefined) masterAgencyUpdates.postalCode = updateData.postalCode;
      if (updateData.country !== undefined) masterAgencyUpdates.country = updateData.country;
      if (camel.taxId || camel.gstin) masterAgencyUpdates.taxId = (camel.taxId || camel.gstin).toUpperCase().trim();

      if (Object.keys(masterAgencyUpdates).length > 1) {
        await db
          .update(agencies)
          .set(masterAgencyUpdates)
          .where(eq(agencies.id, agencyId))
          .catch((err) => {
            this.logger.warn({ err, context: 'sync master agency' }, 'Could not sync master agency fields');
          });
      }

      return resultSettings;
    } catch (error) {
      this.logger.error({ error, context: 'updateAgencySettings', agencyId, input });
      throw new AppError('Failed to update agency settings');
    }
  }
}
