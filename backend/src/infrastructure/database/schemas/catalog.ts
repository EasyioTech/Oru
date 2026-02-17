
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, uniqueIndex, index, decimal, date } from 'drizzle-orm/pg-core';
import { sql, isNull } from 'drizzle-orm';
import { pageCategoryEnum, pageAssignmentStatusEnum, pageRequestStatusEnum } from './enums.js';
import { users } from './users.js';
import { agencies } from './agency.js';

/**
 * Page Catalog Table
 * Central catalog of all available pages/modules in the system
 */
export const pageCatalog = pgTable('page_catalog', {
    id: uuid('id').defaultRandom().primaryKey(),
    path: text('path').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    icon: text('icon'),
    category: pageCategoryEnum('category').notNull(),
    parentPageId: uuid('parent_page_id').references((): any => pageCatalog.id, { onDelete: 'set null' }),
    displayOrder: integer('display_order').default(0).notNull(),
    baseCost: decimal('base_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    billingCycle: text('billing_cycle').default('monthly'),
    minSubscriptionTier: text('min_subscription_tier'),
    requiredFeatures: text('required_features').array().default([]),
    dependentPages: uuid('dependent_pages').array(),
    isActive: boolean('is_active').default(true).notNull(),
    isBeta: boolean('is_beta').default(false).notNull(),
    requiresApproval: boolean('requires_approval').default(false).notNull(),
    requiresOnboarding: boolean('requires_onboarding').default(false).notNull(),
    hasTrial: boolean('has_trial').default(false).notNull(),
    trialDurationDays: integer('trial_duration_days'),
    permissionsRequired: text('permissions_required').array().default([]),
    apiQuotaDefault: integer('api_quota_default'),
    storageQuotaMb: integer('storage_quota_mb'),
    maxConcurrentUsers: integer('max_concurrent_users'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoKeywords: text('seo_keywords').array(),
    documentationUrl: text('documentation_url'),
    videoTutorialUrl: text('video_tutorial_url'),
    supportEmail: text('support_email'),
    releaseDate: date('release_date'),
    deprecationDate: date('deprecation_date'),
    replacementPageId: uuid('replacement_page_id').references((): any => pageCatalog.id),
    tags: text('tags').array().default([]),
    metadata: jsonb('metadata').default({}).notNull(),
    analyticsEnabled: boolean('analytics_enabled').default(true).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    pathIdx: uniqueIndex('idx_page_catalog_path').on(table.path).where(isNull(table.deletedAt)),
    categoryIdx: index('idx_page_catalog_category').on(table.category).where(sql`is_active = true AND deleted_at IS NULL`),
    parentPageIdIdx: index('idx_page_catalog_parent_page_id').on(table.parentPageId).where(sql`parent_page_id IS NOT NULL`),
    isActiveIdx: index('idx_page_catalog_is_active').on(table.isActive).where(isNull(table.deletedAt)),
    displayOrderIdx: index('idx_page_catalog_display_order').on(table.category, table.displayOrder),
}));

/**
 * Page Recommendation Rules
 */
export const pageRecommendationRules = pgTable('page_recommendation_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    pageId: uuid('page_id').notNull().unique().references(() => pageCatalog.id, { onDelete: 'cascade' }),
    industry: text('industry').array(),
    companySize: text('company_size').array(),
    primaryFocus: text('primary_focus').array(),
    businessGoals: text('business_goals').array(),
    priority: integer('priority').default(5).notNull(),
    weight: decimal('weight', { precision: 5, scale: 2 }).default('1.0').notNull(),
    isRequired: boolean('is_required').default(false).notNull(),
    minEmployees: integer('min_employees'),
    maxEmployees: integer('max_employees'),
    minRevenue: decimal('min_revenue', { precision: 15, scale: 2 }),
    maxRevenue: decimal('max_revenue', { precision: 15, scale: 2 }),
    geographicRegions: text('geographic_regions').array(),
    excludeIndustries: text('exclude_industries').array(),
    customCriteria: jsonb('custom_criteria').default({}).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    pageIdIdx: index('idx_page_recommendation_rules_page_id').on(table.pageId).where(sql`is_active = true`),
    priorityIdx: index('idx_page_recommendation_rules_priority').on(table.priority),
}));

/**
 * Agency Page Assignments Table
 * Tracks which pages/modules are assigned to which agencies
 */
export const agencyPageAssignments = pgTable('agency_page_assignments', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').notNull().references(() => agencies.id, { onDelete: 'cascade' }),
    pageId: uuid('page_id').notNull().references(() => pageCatalog.id, { onDelete: 'cascade' }),
    status: pageAssignmentStatusEnum('status').default('active').notNull(),
    costOverride: decimal('cost_override', { precision: 12, scale: 2 }),
    billingCycleOverride: text('billing_cycle_override'),
    discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
    isTrial: boolean('is_trial').default(false).notNull(),
    trialStartedAt: timestamp('trial_started_at', { withTimezone: true }),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    assignedBy: uuid('assigned_by').references(() => users.id),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    suspendedAt: timestamp('suspended_at', { withTimezone: true }),
    suspendedBy: uuid('suspended_by').references(() => users.id),
    suspensionReason: text('suspension_reason'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    autoRenew: boolean('auto_renew').default(true).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
    customQuota: jsonb('custom_quota').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    uniqueAgencyPage: uniqueIndex('unique_agency_page').on(table.agencyId, table.pageId),
    agencyIdIdx: index('idx_agency_page_assignments_agency_id').on(table.agencyId),
    pageIdIdx: index('idx_agency_page_assignments_page_id').on(table.pageId),
    statusIdx: index('idx_agency_page_assignments_status').on(table.status),
    trialIdx: index('idx_agency_page_assignments_trial').on(table.trialEndsAt).where(sql`is_trial = true AND status = 'trial'`),
    expiresIdx: index('idx_agency_page_assignments_expires').on(table.expiresAt).where(sql`expires_at IS NOT NULL`),
}));

/**
 * Page Pricing Tiers
 */
export const pagePricingTiers = pgTable('page_pricing_tiers', {
    id: uuid('id').defaultRandom().primaryKey(),
    pageId: uuid('page_id').notNull().references(() => pageCatalog.id, { onDelete: 'cascade' }),
    tierName: text('tier_name').notNull(),
    tierLevel: integer('tier_level').notNull(),
    cost: decimal('cost', { precision: 12, scale: 2 }).default('0').notNull(),
    billingCycle: text('billing_cycle').default('monthly').notNull(),
    quotaOverrides: jsonb('quota_overrides').default({}).notNull(),
    featureFlags: jsonb('feature_flags').default({}).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    validFrom: date('valid_from'),
    validUntil: date('valid_until'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    uniquePageTier: uniqueIndex('unique_page_tier').on(table.pageId, table.tierName, table.billingCycle),
    pageIdIdx: index('idx_page_pricing_tiers_page_id').on(table.pageId).where(sql`is_active = true`),
    tierNameIdx: index('idx_page_pricing_tiers_tier_name').on(table.tierName),
}));

/**
 * Agency Page Requests Table
 * Tracks requests for new pages/modules
 */
export const agencyPageRequests = pgTable('agency_page_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').notNull().references(() => agencies.id, { onDelete: 'cascade' }),
    pageId: uuid('page_id').notNull().references(() => pageCatalog.id, { onDelete: 'cascade' }),
    requestedBy: uuid('requested_by').notNull().references(() => users.id),
    status: pageRequestStatusEnum('status').default('pending').notNull(),
    priority: text('priority').default('normal'),
    reason: text('reason').notNull(),
    businessJustification: text('business_justification'),
    expectedUsage: text('expected_usage'),
    expectedUsers: integer('expected_users'),
    budgetAllocated: decimal('budget_allocated', { precision: 12, scale: 2 }),
    desiredStartDate: date('desired_start_date'),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewNotes: text('review_notes'),
    approvedCost: decimal('approved_cost', { precision: 12, scale: 2 }),
    rejectionReason: text('rejection_reason'),
    autoApproved: boolean('auto_approved').default(false).notNull(),
    attachments: jsonb('attachments').default([]),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_agency_page_requests_agency_id').on(table.agencyId),
    pageIdIdx: index('idx_agency_page_requests_page_id').on(table.pageId),
    statusIdx: index('idx_agency_page_requests_status').on(table.status),
    requestedByIdx: index('idx_agency_page_requests_requested_by').on(table.requestedBy),
    priorityIdx: index('idx_agency_page_requests_priority').on(table.priority, table.status),
}));

/**
 * Page Usage Analytics
 */
export const pageUsageAnalytics = pgTable('page_usage_analytics', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').notNull().references(() => agencies.id, { onDelete: 'cascade' }),
    pageId: uuid('page_id').notNull().references(() => pageCatalog.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    date: date('date').notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    uniqueUsers: integer('unique_users').default(0).notNull(),
    totalDurationSeconds: integer('total_duration_seconds').default(0).notNull(),
    avgSessionDurationSeconds: integer('avg_session_duration_seconds'),
    actionCount: integer('action_count').default(0).notNull(),
    errorCount: integer('error_count').default(0).notNull(),
    performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    uniquePageUsage: uniqueIndex('unique_page_usage_daily').on(table.agencyId, table.pageId, table.date, table.userId),
    agencyIdIdx: index('idx_page_usage_analytics_agency_id').on(table.agencyId),
    pageIdIdx: index('idx_page_usage_analytics_page_id').on(table.pageId),
    dateIdx: index('idx_page_usage_analytics_date').on(table.date),
}));
