import { eq, and, desc, gte, lte, sql, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { auditLogs, platformSettings, agencyProvisioningJobs } from './schema.js';
import type { AuditLog, PlatformSetting, PlatformMetrics, AdminAuditLogQuery } from './types.js';
import { agencies, profiles, users, subscriptionPlans } from '../../infrastructure/database/schema.js';

export class AdminService {
  constructor(private db: NodePgDatabase<any>) {}

  async getPlatformStats(): Promise<PlatformMetrics> {
    const [agencyStats] = await this.db.select({
      totalAgencies: sql`COUNT(*)`,
      activeAgencies: sql`COUNT(*) FILTER (WHERE is_active = true)`,
      recentSignups: sql`COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')`,
    }).from(agencies);

    const [userStats] = await this.db.select({
      totalUsers: sql`COUNT(*)`,
    }).from(profiles).where(isNull(profiles.deletedAt));

    const planBreakdown = await this.db.select({
      plan: agencies.subscriptionPlan,
      count: sql`COUNT(*)`,
    }).from(agencies)
      .leftJoin(subscriptionPlans, eq(subscriptionPlans.slug, agencies.subscriptionPlan))
      .groupBy(agencies.subscriptionPlan);

    return {
      totalAgencies: Number(agencyStats?.totalAgencies ?? 0),
      activeAgencies: Number(agencyStats?.activeAgencies ?? 0),
      recentSignups: Number(agencyStats?.recentSignups ?? 0),
      totalUsers: Number(userStats?.totalUsers ?? 0),
      totalRevenue: 0,
      agenciesByPlan: Object.fromEntries(
        (planBreakdown as any[]).map((r: any) => [r.plan ?? 'unknown', Number(r.count)])
      ),
    };
  }

  async listAgencies(opts: { limit?: number; offset?: number; search?: string }) {
    let conditions = [];
    if (opts.search) {
      conditions.push(sql`${agencies.name} ILIKE ${'%' + opts.search + '%'}`);
    }
    const data = await this.db.select({
      id: agencies.id,
      name: agencies.name,
      domain: agencies.domain,
      subscriptionPlan: agencies.subscriptionPlan,
      status: agencies.status,
      isActive: agencies.isActive,
      maxUsers: agencies.maxUsers,
      createdAt: agencies.createdAt,
    })
      .from(agencies)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0)
      .orderBy(desc(agencies.createdAt));
      
    return data;
  }

  async getAgency(id: string) {
    const [agency] = await this.db.select().from(agencies).where(eq(agencies.id, id));
    return agency || null;
  }

  async updateAgency(id: string, data: Partial<typeof agencies.$inferInsert>) {
    const [agency] = await this.db.update(agencies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(agencies.id, id))
      .returning();
    return agency || null;
  }

  async listAllUsers(opts: { limit?: number; offset?: number }) {
    const data = await this.db.select({
      id: users.id,
      email: users.email,
      fullName: profiles.fullName,
      agencyId: profiles.agencyId,
      status: users.status,
      createdAt: users.createdAt,
    })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0)
      .orderBy(desc(users.createdAt));
    return data;
  }

  async getAuditLogs(query: AdminAuditLogQuery): Promise<AuditLog[]> {
    const conditions: any[] = [];

    if (query.agencyId) conditions.push(eq(auditLogs.agencyId, query.agencyId));
    if (query.userId) conditions.push(eq(auditLogs.userId, query.userId));
    if (query.resourceType) conditions.push(eq(auditLogs.resourceType, query.resourceType));
    if (query.action) conditions.push(eq(auditLogs.action, query.action));
    if (query.from) conditions.push(gte(auditLogs.createdAt, new Date(query.from)));
    if (query.to) conditions.push(lte(auditLogs.createdAt, new Date(query.to)));

    return this.db
      .select()
      .from(auditLogs)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(query.limit ?? 50)
      .offset(query.offset ?? 0) as unknown as Promise<AuditLog[]>;
  }

  async createAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [log] = await this.db.insert(auditLogs).values(data).returning();
    return log as unknown as AuditLog;
  }

  async getPlatformSettings(publicOnly = false): Promise<PlatformSetting[]> {
    if (publicOnly) {
      return this.db.select().from(platformSettings).where(eq(platformSettings.isPublic, true)) as unknown as Promise<PlatformSetting[]>;
    }
    return this.db.select().from(platformSettings).orderBy(platformSettings.key) as unknown as Promise<PlatformSetting[]>;
  }

  async upsertPlatformSetting(
    key: string,
    value: Record<string, any>,
    updatedBy: string,
    opts?: { description?: string; isPublic?: boolean }
  ): Promise<PlatformSetting> {
    const [setting] = await this.db
      .insert(platformSettings)
      .values({ key, value, updatedBy, ...opts })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value, updatedBy, updatedAt: new Date(), ...opts },
      })
      .returning();
    return setting as unknown as PlatformSetting;
  }

  async getProvisioningJobs(agencyId?: string) {
    const conditions = agencyId ? [eq(agencyProvisioningJobs.agencyId, agencyId)] : [];
    
    return this.db
      .select()
      .from(agencyProvisioningJobs)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(agencyProvisioningJobs.createdAt))
      .limit(100);
  }
}
