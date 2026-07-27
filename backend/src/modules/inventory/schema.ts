import { pgTable, uuid, text, timestamp, boolean, numeric, integer, index } from 'drizzle-orm/pg-core';
import { agencies } from '../../infrastructure/database/schemas/agency.js';
import { users } from '../../infrastructure/database/schemas/users.js';

export const warehouses = pgTable('warehouses', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    country: text('country').default('India').notNull(),
    contactPerson: text('contact_person'),
    phone: text('phone'),
    email: text('email'),
    isActive: boolean('is_active').default(true).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdx: index('idx_warehouses_agency_id').on(table.agencyId),
}));

export const productCategories = pgTable('product_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    parentId: uuid('parent_id'), // self reference not enforced
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: uuid('category_id').references(() => productCategories.id),
    brand: text('brand'),
    unitOfMeasure: text('unit_of_measure').default('pcs'),
    barcode: text('barcode'),
    qrCode: text('qr_code'),
    weight: numeric('weight', { precision: 12, scale: 3 }),
    dimensions: text('dimensions'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true).notNull(),
    isTrackable: boolean('is_trackable').default(false).notNull(),
    trackBy: text('track_by').default('none'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inventory = pgTable('inventory', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    variantId: uuid('variant_id'),
    warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 3 }).default('0').notNull(),
    reservedQuantity: numeric('reserved_quantity', { precision: 12, scale: 3 }).default('0').notNull(),
    availableQuantity: numeric('available_quantity', { precision: 12, scale: 3 }).default('0').notNull(), // Usually a computed column, but added for compatibility with low stock query
    reorderPoint: numeric('reorder_point', { precision: 12, scale: 3 }).default('0'),
    reorderQuantity: numeric('reorder_quantity', { precision: 12, scale: 3 }).default('0'),
    valuationMethod: text('valuation_method').default('weighted_average'),
    averageCost: numeric('average_cost', { precision: 12, scale: 2 }).default('0'),
    lastCost: numeric('last_cost', { precision: 12, scale: 2 }).default('0'),
    lastMovementDate: timestamp('last_movement_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryTransactions = pgTable('inventory_transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
    inventoryId: uuid('inventory_id').references(() => inventory.id).notNull(),
    transactionType: text('transaction_type').notNull(), // IN, OUT, TRANSFER, ADJUSTMENT
    quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
    unitCost: numeric('unit_cost', { precision: 12, scale: 2 }),
    referenceType: text('reference_type'),
    referenceId: uuid('reference_id'),
    fromWarehouseId: uuid('from_warehouse_id').references(() => warehouses.id),
    toWarehouseId: uuid('to_warehouse_id').references(() => warehouses.id),
    serialNumbers: text('serial_numbers'),
    batchNumber: text('batch_number'),
    expiryDate: timestamp('expiry_date', { withTimezone: true }),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
