import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  agencies,
  users,
  userRoles,
  profiles,
  agencySettings,
  workspaceProfiles,
  auditLogs,
} from '../../../infrastructure/database/schema.js';
import { hashPassword } from '../../../utils/password.js';
import { AppError } from '../../../utils/errors.js';
import { transformAgencyRow } from '../../../infrastructure/transformers/agency.transformer.js';
import { INDIAN_ERP_DEFAULTS } from './default-settings.js';
import { buildStarterModulesPayload } from './starter-modules.js';
import { resolveUniqueDomainSlug } from './domain-slug.js';

export interface ProvisionAgencyInput {
  agencyName: string;
  adminEmail: string;
  adminName?: string;
  adminPassword?: string;
  adminPhone?: string;
  domain?: string;
  subscriptionPlan?: 'trial' | 'starter' | 'basic' | 'professional' | 'enterprise' | 'custom';
  industry?: string;
  teamSize?: string;
  companySize?: string;
  primaryFocus?: string;
  timezone?: string;
  enableGST?: boolean;
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  billingEmail?: string;
  maxUsers?: number;
  maxStorageGB?: number;
  existingAgencyId?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  jwt?: any;
}

export interface ProvisionAgencyResult {
  agency: any;
  user: any;
  agencyId: string;
  workspaceId: string;
  accessToken?: string;
  refreshToken?: string;
  message: string;
}

/**
 * Concrete, atomic tenant provisioner.
 * Guarantees every new agency has an active status, owner linkage,
 * Indian ERP business settings, and a fully enabled starter workspace.
 */
export async function provisionNewAgency(
  db: NodePgDatabase<any>,
  input: ProvisionAgencyInput,
  logger?: any
): Promise<ProvisionAgencyResult> {
  const normalizedEmail = (input.adminEmail || '').toLowerCase().trim();
  if (!normalizedEmail) {
    throw new AppError('Admin email is required for agency provisioning', 400);
  }

  const companyName = (input.agencyName || '').trim();
  if (!companyName) {
    throw new AppError('Agency name is required for agency provisioning', 400);
  }

  const rawPassword = input.adminPassword || 'OruSecure2026!';
  const hashedPassword = await hashPassword(rawPassword);

  const result = await db.transaction(async (tx) => {
    // 1. Resolve unique domain slug
    const finalDomain = await resolveUniqueDomainSlug(
      tx,
      input.domain || companyName,
      input.existingAgencyId
    );

    // 2. Resolve or create user account
    let userId: string;
    let userRow: any;
    const [existingUser] = await tx
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;
      userRow = existingUser;
    } else {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: normalizedEmail,
          emailNormalized: normalizedEmail,
          passwordHash: hashedPassword,
          status: 'active',
          emailConfirmed: true,
        })
        .returning();
      userId = newUser.id;
      userRow = newUser;
    }

    // 3. Create or update agency
    let agencyId = input.existingAgencyId;
    let agencyRow: any;

    const baseMetadata = {
      ...(input.metadata || {}),
      industry: input.industry,
      teamSize: input.teamSize,
      companySize: input.companySize,
      primaryFocus: input.primaryFocus,
      provisionedAt: new Date().toISOString(),
    };

    const baseSettings = {
      currency: INDIAN_ERP_DEFAULTS.currency,
      locale: INDIAN_ERP_DEFAULTS.locale,
      timezone: input.timezone || INDIAN_ERP_DEFAULTS.timezone,
      enableGST: input.enableGST !== undefined ? input.enableGST : true,
      ...(input.settings || {}),
    };

    if (agencyId) {
      const [updated] = await tx
        .update(agencies)
        .set({
          status: 'active',
          isActive: true,
          ownerUserId: userId,
          contactEmail: normalizedEmail,
          contactPhone: input.adminPhone || undefined,
          billingEmail: input.billingEmail || normalizedEmail,
          address: input.streetAddress || input.address || undefined,
          city: input.city || undefined,
          state: input.state || undefined,
          postalCode: input.postalCode || undefined,
          country: input.country || 'India',
          taxId: input.taxId || undefined,
          updatedAt: new Date(),
        })
        .where(eq(agencies.id, agencyId))
        .returning();
      agencyRow = updated;
    } else {
      const [created] = await tx
        .insert(agencies)
        .values({
          name: companyName,
          domain: finalDomain,
          ownerUserId: userId,
          subscriptionPlan: input.subscriptionPlan || 'trial',
          status: 'active',
          isActive: true,
          maxUsers: input.maxUsers || 50,
          maxStorageGB: input.maxStorageGB || 10,
          contactEmail: normalizedEmail,
          contactPhone: input.adminPhone,
          billingEmail: input.billingEmail || normalizedEmail,
          address: input.streetAddress || input.address,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country || 'India',
          taxId: input.taxId,
          settings: baseSettings,
          metadata: baseMetadata,
        })
        .returning();
      agencyId = created.id;
      agencyRow = created;
    }

    // 4. Assign agency_admin role
    const [existingRole] = await tx
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.agencyId, agencyId),
          eq(userRoles.role, 'agency_admin')
        )
      )
      .limit(1);

    if (!existingRole) {
      await tx.insert(userRoles).values({
        userId,
        agencyId,
        role: 'agency_admin',
        permissions: ['*'],
        isActive: true,
      });
    } else {
      await tx
        .update(userRoles)
        .set({ permissions: ['*'], isActive: true })
        .where(eq(userRoles.id, existingRole.id));
    }

    // 5. Create or update profile
    const [existingProfile] = await tx
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const displayName = (input.adminName || 'Admin').trim();
    if (existingProfile) {
      await tx
        .update(profiles)
        .set({ agencyId, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
    } else {
      await tx.insert(profiles).values({
        userId,
        agencyId,
        fullName: displayName,
      });
    }

    // 6. Seed Indian ERP agency settings
    const [existingSettings] = await tx
      .select()
      .from(agencySettings)
      .where(eq(agencySettings.agencyId, agencyId))
      .limit(1);

    if (!existingSettings) {
      await tx.insert(agencySettings).values({
        agencyId,
        agencyName: companyName,
        domain: finalDomain,
        timezone: input.timezone || INDIAN_ERP_DEFAULTS.timezone,
        dateFormat: INDIAN_ERP_DEFAULTS.dateFormat,
        fiscalYearStart: INDIAN_ERP_DEFAULTS.fiscalYearStart,
        workingHoursStart: INDIAN_ERP_DEFAULTS.workingHoursStart,
        workingHoursEnd: INDIAN_ERP_DEFAULTS.workingHoursEnd,
        workingDays: INDIAN_ERP_DEFAULTS.workingDays,
        primaryColor: INDIAN_ERP_DEFAULTS.primaryColor,
        secondaryColor: INDIAN_ERP_DEFAULTS.secondaryColor,
      });
    }

    // 7. Seed workspace profile with valid UUID workspace_id
    const [existingWorkspace] = await tx
      .select()
      .from(workspaceProfiles)
      .where(eq(workspaceProfiles.workspace_id, agencyId))
      .limit(1);

    if (!existingWorkspace) {
      await tx.insert(workspaceProfiles).values({
        workspace_id: agencyId,
        modules_json: buildStarterModulesPayload(),
        collaboration_json: { members_count: 1, solo: false, email_verified: true },
        adoption_json: { features_used: [], days_active: 1, last_action: new Date().toISOString() },
        health_json: { score: 100, last_updated: new Date().toISOString() },
        recommendations_json: [],
        quick_wins_json: [],
      });
    }

    // 8. Audit log
    await tx.insert(auditLogs).values({
      agencyId,
      userId,
      tableName: 'agencies',
      recordId: agencyId,
      action: 'create',
      newValues: {
        name: companyName,
        domain: finalDomain,
        subscriptionPlan: input.subscriptionPlan || 'trial',
        status: 'active',
      },
      metadata: { source: 'agency_provisioner' },
    });

    return {
      agency: agencyRow,
      user: userRow,
      agencyId,
      workspaceId: agencyId,
    };
  });

  // Optional: generate JWT auth tokens if JWT instance was passed (e.g. signup flow)
  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  if (input.jwt) {
    accessToken = input.jwt.sign({
      id: result.user.id,
      email: result.user.email,
      roles: ['agency_admin'],
      agencyId: result.agencyId,
    });
    refreshToken = input.jwt.sign(
      { id: result.user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );
  }

  if (logger) {
    logger.info(
      { agencyId: result.agencyId, domain: result.agency.domain },
      'Agency provisioned successfully with settings and workspace'
    );
  }

  return {
    agency: transformAgencyRow(result.agency),
    user: result.user,
    agencyId: result.agencyId,
    workspaceId: result.workspaceId,
    accessToken,
    refreshToken,
    message: 'Agency creation completed instantly',
  };
}
