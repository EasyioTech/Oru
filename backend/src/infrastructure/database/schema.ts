import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, pgEnum, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --- Enums ---
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'manager', 'employee', 'viewer', 'user']);
export const agencyTierEnum = pgEnum('agency_tier', ['free', 'pro', 'enterprise']);
export const agencyStatusEnum = pgEnum('agency_status', ['active', 'suspended', 'pending_deletion']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'canceled', 'incomplete']);

// --- Agencies Table (Tenants) ---
export const agencies = pgTable('agencies', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    domain: text('domain').unique(),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    databaseName: text('database_name').notNull().unique(),
    status: agencyStatusEnum('status').default('active').notNull(),
    tier: agencyTierEnum('tier').default('free').notNull(),
    billingEmail: text('billing_email'),
    maxConnections: integer('max_connections').default(20),
    maxStorageGB: integer('max_storage_gb').default(5),
    branding: jsonb('branding').default({ logo: null, primaryColor: '#007bff' }),
    features: jsonb('features').default({}),
    limits: jsonb('limits').default({ maxUsers: 5, storageGB: 1 }),
    settings: jsonb('settings').default({}),
    lastBackupAt: timestamp('last_backup_at', { withTimezone: true }),
    dbSizeMB: integer('db_size_mb'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Users Table ---
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    emailVerified: boolean('email_verified').default(false),
    image: text('image'),
    passwordHash: text('password_hash'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    role: userRoleEnum('role').default('user').notNull(),
    phone: text('phone'),
    agencyId: uuid('agency_id').references(() => agencies.id),
    departmentId: uuid('department_id'),
    emailConfirmed: boolean('email_confirmed').default(false),
    emailConfirmedAt: timestamp('email_confirmed_at', { withTimezone: true }),
    banned: boolean('banned'),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires', { withTimezone: true }),
    twoFactorEnabled: boolean('two_factor_enabled').default(false),
    twoFactorSecret: text('two_factor_secret'),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    rawUserMetaData: jsonb('raw_user_meta_data').default({}),
    preferences: jsonb('preferences').default({ theme: 'light', notifications: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table: any) => ({
    emailNormalizedIdx: uniqueIndex('idx_users_email_normalized').on(sql`lower(trim(${table.email}))`),
}));

// --- Departments Table ---
export const departments = pgTable('departments', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    agencyId: uuid('agency_id').references(() => agencies.id).notNull(),
    managerId: text('manager_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Projects Table ---
export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('active'),
    agencyId: uuid('agency_id').references(() => agencies.id).notNull(),
    leadId: text('lead_id').references(() => users.id),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Audit Logs ---
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => users.id),
    agencyId: uuid('agency_id').references(() => agencies.id),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id'),
    details: jsonb('details').default({}),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Profiles Table ---
export const profiles = pgTable('profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
    fullName: text('full_name'),
    phone: text('phone'),
    department: text('department'),
    position: text('position'),
    hireDate: timestamp('hire_date', { withTimezone: true }),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(true),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }),
    personalEmail: text('personal_email'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Agency Provisioning Jobs ---
export const agencyProvisioningJobs = pgTable('agency_provisioning_jobs', {
    id: uuid('id').defaultRandom().primaryKey(),
    idempotencyKey: text('idempotency_key').unique(),
    status: text('status').notNull().default('pending'),
    domain: text('domain').notNull(),
    agencyName: text('agency_name').notNull(),
    payload: jsonb('payload').default({}).notNull(),
    result: jsonb('result'),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
});

// --- Page Catalog ---
export const pageCatalog = pgTable('page_catalog', {
    id: uuid('id').defaultRandom().primaryKey(),
    path: text('path').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    icon: text('icon'),
    category: text('category').notNull(),
    base_cost: integer('base_cost').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    requiresApproval: boolean('requires_approval').default(false).notNull(),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- Relations ---
export const agenciesRelations = relations(agencies, ({ many }) => ({
    users: many(users),
    departments: many(departments),
    projects: many(projects),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    agency: one(agencies, {
        fields: [users.agencyId],
        references: [agencies.id],
    }),
    ledDepartments: many(departments),
    ledProjects: many(projects),
}));
