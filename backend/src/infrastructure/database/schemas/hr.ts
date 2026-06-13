import { pgTable, uuid, text, timestamp, date, numeric, uniqueIndex, index, integer, boolean } from 'drizzle-orm/pg-core';
import { isNull, sql } from 'drizzle-orm';
import { agencies } from './agency.js';
import { users } from './users.js';
import { profiles } from './auth.js';

export const departments = pgTable('departments', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    managerId: uuid('manager_id').references(() => profiles.id),
    parentDepartmentId: uuid('parent_department_id'), // Self-reference added below
    budget: numeric('budget', { precision: 12, scale: 2 }),
    
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdNameIdx: uniqueIndex('idx_departments_agency_name').on(table.agencyId, table.name).where(isNull(table.deletedAt)),
}));

export const employees = pgTable('employees', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id), // null if not a platform user
    profileId: uuid('profile_id').references(() => profiles.id),
    departmentId: uuid('department_id').references(() => departments.id),
    
    employeeCode: text('employee_code'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    position: text('position'),
    
    employmentType: text('employment_type'), // full_time, part_time, contract, intern
    status: text('status').default('active').notNull(), // active, inactive, terminated
    hireDate: date('hire_date'),
    salary: numeric('salary', { precision: 12, scale: 2 }),
    
    emergencyContactName: text('emergency_contact_name'),
    emergencyContactPhone: text('emergency_contact_phone'),
    address: text('address'),
    avatarUrl: text('avatar_url'),
    notes: text('notes'),
    
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdCodeIdx: uniqueIndex('idx_employees_agency_code').on(table.agencyId, table.employeeCode).where(sql`employee_code IS NOT NULL AND deleted_at IS NULL`),
    agencyIdEmailIdx: uniqueIndex('idx_employees_agency_email').on(table.agencyId, table.email).where(isNull(table.deletedAt)),
    departmentIdx: index('idx_employees_department').on(table.departmentId),
    statusIdx: index('idx_employees_status').on(table.status),
}));

export const leaveTypes = pgTable('leave_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    maxDaysPerYear: integer('max_days_per_year'),
    isPaid: boolean('is_paid').default(true).notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdNameIdx: uniqueIndex('idx_leave_types_agency_name').on(table.agencyId, table.name),
}));

export const leaveRequests = pgTable('leave_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    employeeId: uuid('employee_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    leaveTypeId: uuid('leave_type_id').references(() => leaveTypes.id, { onDelete: 'restrict' }).notNull(),
    
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    totalDays: integer('total_days').notNull(),
    reason: text('reason'),
    status: text('status').default('pending').notNull(), // pending, approved, rejected
    
    approvedBy: uuid('approved_by').references(() => users.id),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),

    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_leave_requests_agency_id').on(table.agencyId),
    employeeIdIdx: index('idx_leave_requests_employee_id').on(table.employeeId),
    statusIdx: index('idx_leave_requests_status').on(table.status),
}));
