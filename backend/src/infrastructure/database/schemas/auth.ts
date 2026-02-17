
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, inet, uniqueIndex, index, date } from 'drizzle-orm/pg-core';
import { sql, isNull } from 'drizzle-orm';
import { users } from './users.js';
import { agencies } from './agency.js';
import { userRoleEnum } from './enums.js';

/**
 * User Sessions Table
 * Tracks active user sessions with tokens
 */
export const userSessions = pgTable('user_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    refreshTokenHash: text('refresh_token_hash'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    deviceFingerprint: text('device_fingerprint'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    refreshExpiresAt: timestamp('refresh_expires_at', { withTimezone: true }),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: text('revoked_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    tokenHashIdx: uniqueIndex('idx_user_sessions_token_hash').on(table.tokenHash).where(sql`is_active = true AND revoked_at IS NULL`),
    userIdIdx: index('idx_user_sessions_user_id').on(table.userId).where(sql`is_active = true`),
    expiresAtIdx: index('idx_user_sessions_expires_at').on(table.expiresAt).where(sql`is_active = true`),
}));

/**
 * Email Verification Tokens Table
 */
export const emailVerificationTokens = pgTable('email_verification_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    email: text('email').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    tokenHashIdx: uniqueIndex('idx_email_verification_tokens_token_hash').on(table.tokenHash).where(isNull(table.usedAt)),
    userIdIdx: index('idx_email_verification_tokens_user_id').on(table.userId).where(isNull(table.usedAt)),
    expiresAtIdx: index('idx_email_verification_tokens_expires_at').on(table.expiresAt).where(isNull(table.usedAt)),
}));

/**
 * Password Reset Tokens Table
 */
export const passwordResetTokens = pgTable('password_reset_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    tokenHashIdx: uniqueIndex('idx_password_reset_tokens_token_hash').on(table.tokenHash).where(isNull(table.usedAt)),
    userIdIdx: index('idx_password_reset_tokens_user_id').on(table.userId).where(isNull(table.usedAt)),
    expiresAtIdx: index('idx_password_reset_tokens_expires_at').on(table.expiresAt).where(isNull(table.usedAt)),
}));

/**
 * Profiles Table
 * Extended user profile information
 */
export const profiles = pgTable('profiles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }),
    fullName: text('full_name'),
    displayName: text('display_name'),
    phone: text('phone'),
    phoneExtension: text('phone_extension'),
    department: text('department'),
    position: text('position'),
    employeeCode: text('employee_code'),
    hireDate: date('hire_date'),
    avatarUrl: text('avatar_url'),
    personalEmail: text('personal_email'),
    personalEmailVerified: boolean('personal_email_verified').default(false).notNull(),
    personalEmailVerifiedAt: timestamp('personal_email_verified_at', { withTimezone: true }),
    timezone: text('timezone').default('UTC'),
    language: text('language').default('en'),
    dateFormat: text('date_format').default('YYYY-MM-DD'),
    timeFormat: text('time_format').default('24h'),
    notificationPreferences: jsonb('notification_preferences').default({}).notNull(),
    themePreferences: jsonb('theme_preferences').default({}).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    bio: text('bio'),
    socialLinks: jsonb('social_links'),
    metadata: jsonb('metadata').default({}).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userIdIdx: uniqueIndex('idx_profiles_user_id').on(table.userId).where(isNull(table.deletedAt)),
    agencyIdIdx: index('idx_profiles_agency_id').on(table.agencyId).where(isNull(table.deletedAt)),
    employeeCodeIdx: index('idx_profiles_employee_code').on(table.employeeCode).where(sql`employee_code IS NOT NULL AND deleted_at IS NULL`),
    fullNameIdx: index('idx_profiles_full_name').on(table.fullName).where(isNull(table.deletedAt)),
    isActiveIdx: index('idx_profiles_is_active').on(table.isActive).where(isNull(table.deletedAt)),
}));

/**
 * User Roles Table
 * Manages user roles and permissions per agency
 */
export const userRoles = pgTable('user_roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').notNull(),
    customRoleName: text('custom_role_name'),
    permissions: jsonb('permissions').default([]).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    assignedBy: uuid('assigned_by').references(() => users.id),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedBy: uuid('revoked_by').references(() => users.id),
    metadata: jsonb('metadata').default({}).notNull(),
}, (table) => ({
    activeUniqueIdx: uniqueIndex('idx_user_roles_active_unique').on(table.userId, table.role, table.agencyId).where(sql`is_active = true AND revoked_at IS NULL`),
    userIdIdx: index('idx_user_roles_user_id').on(table.userId),
    agencyIdIdx: index('idx_user_roles_agency_id').on(table.agencyId).where(sql`agency_id IS NOT NULL`),
    roleIdx: index('idx_user_roles_role').on(table.role),
    isActiveIdx: index('idx_user_roles_is_active').on(table.isActive),
    validUntilIdx: index('idx_user_roles_valid_until').on(table.validUntil).where(sql`valid_until IS NOT NULL`),
}));
