
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, inet, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { isNull, sql } from 'drizzle-orm';
import { userStatusEnum } from './enums.js';

/**
 * Users Table
 * Global user accounts that can belong to agencies
 */
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    emailNormalized: text('email_normalized').notNull(), // Generated column in SQL
    passwordHash: text('password_hash').notNull(),

    // Email Verification
    emailConfirmed: boolean('email_confirmed').default(false).notNull(),
    emailConfirmedAt: timestamp('email_confirmed_at', { withTimezone: true }),

    // Phone
    phone: text('phone'),
    phoneExtension: text('phone_extension'),
    phoneVerified: boolean('phone_verified').default(false).notNull(),
    phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),

    // Status & Security
    status: userStatusEnum('status').default('active').notNull(),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    passwordChangedAt: timestamp('password_changed_at', { withTimezone: true }),
    mustChangePassword: boolean('must_change_password').default(false).notNull(),

    // Terms & Privacy
    termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
    termsVersion: text('terms_version'),
    privacyAcceptedAt: timestamp('privacy_accepted_at', { withTimezone: true }),

    // Activity Tracking
    lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
    lastSignInIp: inet('last_sign_in_ip'),
    signInCount: integer('sign_in_count').default(0).notNull(),

    // Metadata
    rawUserMetaData: jsonb('raw_user_meta_data').default({}).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    emailNormalizedIdx: uniqueIndex('idx_users_email_normalized').on(table.emailNormalized).where(isNull(table.deletedAt)),
    emailIdx: index('idx_users_email').on(table.email),
    phoneIdx: index('idx_users_phone').on(table.phone).where(sql`phone IS NOT NULL AND deleted_at IS NULL`),
    statusIdx: index('idx_users_status').on(table.status).where(isNull(table.deletedAt)),
    emailConfirmedIdx: index('idx_users_email_confirmed').on(table.emailConfirmed).where(isNull(table.deletedAt)),
    lockedUntilIdx: index('idx_users_locked_until').on(table.lockedUntil).where(sql`locked_until IS NOT NULL`),
    createdAtIdx: index('idx_users_created_at').on(table.createdAt),
}));
