# ORU ERP Backend Phase 2 — Module Migration Spec
**For: Antigravity Agent | Date: 2026-07-20 | Status: Ready to implement**

## Context

Phase 1 completed: `auth`, `notifications`, `hr`, `crm` — all passing `tsc --noEmit`.

Phase 2 covers: `inventory`, `projects`, `finance`, `procurement`, `reports` (admin last).

**Critical discovery since Phase 1:**
The old services (`inventoryService.js`, `procurementService.js`, etc.) are CommonJS modules using raw SQL via a manual `Pool` connection per request — they bypass the existing Drizzle ORM and `request.agencyDb` entirely. This means Phase 2 is NOT a restructure — it's a full rewrite into proper TypeScript + Drizzle.

**Old stack (what you're replacing):**
- Express routes (`router.get(...)` with `require()`)
- Raw SQL via `pg.Pool` per request (creates a new connection pool every API call — very bad)
- `crypto.randomUUID()` manually called (Drizzle handles this via `uuid().defaultRandom()`)
- CommonJS `module.exports`

**New stack (what you're writing):**
- Fastify route plugins (async function plugin pattern)
- Drizzle ORM with `request.agencyDb` (already injected by `backend/src/fastify/plugins/db.ts`)
- TypeScript strict mode

---

## Reference: Completed Modules

Before writing any code, read these files:
- `backend/src/modules/crm/service.ts` — canonical service pattern
- `backend/src/modules/crm/routes.ts` — canonical Fastify routes pattern  
- `backend/src/modules/hr/abilities.ts` — canonical CASL abilities pattern
- `backend/src/modules/auth/index.ts` — canonical barrel export

**Service constructor:** `constructor(private db: NodePgDatabase<any>, private agencyId: string)`
**Route instantiation:** `const service = new XxxService(request.agencyDb, request.user.agencyId);`
**Route shape:** `{ success: true, data: ... }` always

---

## Module 1: Projects

### Schema
File: `backend/src/modules/projects/schema.ts`

**Source:** Copy from `backend/src/infrastructure/database/schemas/projects.ts` (already exists as Drizzle).

```typescript
// Copy the `projects` table definition verbatim.
// Also define tasks table:
export const projectTasks = pgTable('project_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(), // todo, in_progress, done, cancelled
  priority: text('priority').default('medium').notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  estimatedHours: numeric('estimated_hours', { precision: 8, scale: 2 }),
  actualHours: numeric('actual_hours', { precision: 8, scale: 2 }).default('0'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Service (max 300 lines — split if needed)
File: `backend/src/modules/projects/service.ts`

Key methods to implement:
```typescript
getProjects(filters?: { status?: string; clientId?: string }): Promise<Project[]>
getProject(id: string): Promise<Project>
createProject(data: NewProject): Promise<Project>
updateProject(id: string, data: Partial<NewProject>): Promise<Project>
deleteProject(id: string): Promise<void>
getTasks(projectId: string): Promise<Task[]>
createTask(projectId: string, data: NewTask): Promise<Task>
updateTask(taskId: string, data: Partial<NewTask>): Promise<Task>
```

Port logic from old routes: `backend/src/routes/projectEnhancements.js`

### Routes
File: `backend/src/modules/projects/routes.ts`

Prefix: `/api/projects`

Endpoints:
- `GET /` — list projects (supports `?status=&clientId=`)
- `POST /` — create project
- `GET /:id` — get project with tasks
- `PUT /:id` — update project
- `DELETE /:id` — soft delete

- `GET /:projectId/tasks` — list tasks
- `POST /:projectId/tasks` — create task
- `PUT /tasks/:taskId` — update task status

### Abilities
File: `backend/src/modules/projects/abilities.ts`

```typescript
export const defineProjectAbilities = (user: AuthUser, can: Can, cannot: Cannot) => {
  if (user.roles.includes('admin') || user.roles.includes('manager')) {
    can('manage', 'Project');
    can('manage', 'Task');
  } else {
    can('read', 'Project');
    can('read', 'Task');
    can(['create', 'update'], 'Task'); // employees can manage their own tasks
  }
  if (user.roles.includes('viewer')) {
    cannot('create', 'Project');
    cannot('delete', 'Project');
  }
};
```

### Types
File: `backend/src/modules/projects/types.ts`
```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { projects, projectTasks } from './schema.js';

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
export type Task = InferSelectModel<typeof projectTasks>;
export type NewTask = InferInsertModel<typeof projectTasks>;
```

---

## Module 2: Inventory

### Critical Warning
**There is NO existing Drizzle schema for inventory.** The old `inventoryService.js` created tables via raw SQL. You need to write the Drizzle schema from scratch, inferring table structure from the SQL INSERT statements in the old service file.

Read `backend/src/services/inventoryService.js` to extract all table structures.

### Schema
File: `backend/src/modules/inventory/schema.ts`

Write Drizzle tables for:

**warehouses:**
```typescript
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
```

**products** (extract from inventoryService.js `createProduct` SQL):
```typescript
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: uuid('category_id'),
  unit: text('unit').default('pcs'),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0'),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).default('0'),
  reorderLevel: integer('reorder_level').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**stock_entries** (stock movements):
```typescript
export const stockEntries = pgTable('stock_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  type: text('type').notNull(), // 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }),
  notes: text('notes'),
  referenceId: uuid('reference_id'), // PO or SO id
  referenceType: text('reference_type'), // 'purchase_order' | 'sale'
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**Read the full `inventoryService.js` to catch any table fields I missed.**

### Service
File: `backend/src/modules/inventory/service.ts`

```typescript
getWarehouses(): Promise<Warehouse[]>
createWarehouse(data: NewWarehouse): Promise<Warehouse>
getProducts(filters?: { categoryId?: string; search?: string }): Promise<Product[]>
getProduct(id: string): Promise<Product>
createProduct(data: NewProduct): Promise<Product>
updateProduct(id: string, data: Partial<NewProduct>): Promise<Product>
getStockLevel(productId: string, warehouseId?: string): Promise<StockLevel>
addStockEntry(data: NewStockEntry): Promise<StockEntry>
getLowStockAlerts(): Promise<LowStockAlert[]>
```

### Routes
Prefix: `/api/inventory`
- `GET /warehouses`, `POST /warehouses`
- `GET /products`, `POST /products`, `GET /products/:id`, `PUT /products/:id`
- `POST /stock/entry` — add stock movement
- `GET /stock/levels` — current stock per product/warehouse
- `GET /alerts/low-stock`

---

## Module 3: Finance

### Context
The old finance module is split across many services: `currencyService.js`, `bankReconciliationService.js`, `budgetService.js`.

Read `backend/src/routes/financial.js` to see all endpoints.

### Schema
File: `backend/src/modules/finance/schema.ts`

Write Drizzle tables for the core finance entities. Read `backend/src/services/bankReconciliationService.js` and `backend/src/services/budgetService.js` to extract table structures.

Minimum tables needed:
```typescript
// journal_entries
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  entryNumber: text('entry_number').notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  totalDebit: numeric('total_debit', { precision: 15, scale: 2 }).notNull(),
  totalCredit: numeric('total_credit', { precision: 15, scale: 2 }).notNull(),
  status: text('status').default('draft').notNull(), // draft, posted, reversed
  referenceId: uuid('reference_id'),
  referenceType: text('reference_type'),
  createdBy: uuid('created_by').references(() => users.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// budgets
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  period: text('period').notNull(), // 'monthly', 'quarterly', 'annual'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  status: text('status').default('draft').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**Read the old services for complete field lists before writing the final schema.**

### Service Split
Finance service is large — split into two files:
- `backend/src/modules/finance/service.ts` — journal entries, currencies (max 300 lines)
- `backend/src/modules/finance/budget-service.ts` — budget CRUD and reports (max 300 lines)

### Routes
Prefix: `/api/finance`
Routes can reference either service based on the endpoint domain.

### Jobs
File: `backend/src/modules/finance/jobs.ts`
```typescript
// Payroll calculation — moved to BullMQ from blocking HTTP
export const FINANCE_QUEUE = 'finance';
export const financeJobs = {
  GENERATE_PAYROLL: 'generate-payroll',
  GENERATE_INVOICE: 'generate-invoice',
  GST_REPORT: 'gst-report',
};
// Define job payload types only — actual worker implementation is a separate task
```

---

## Module 4: Procurement

### Context
Read `backend/src/routes/procurement.js` and `backend/src/services/procurementService.js` for all entities.

### Schema
File: `backend/src/modules/procurement/schema.ts`

Key tables (extract exact fields from procurementService.js SQL):
```typescript
// purchase_requisitions
export const purchaseRequisitions = pgTable('purchase_requisitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  requisitionNumber: text('requisition_number').notNull(), // PR-2024-00001
  requestedBy: uuid('requested_by').references(() => users.id).notNull(),
  departmentId: uuid('department_id'),
  status: text('status').default('pending').notNull(), // pending, approved, rejected, fulfilled
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).default('0'),
  notes: text('notes'),
  requiredDate: date('required_date'),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// purchase_orders
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  poNumber: text('po_number').notNull(), // PO-2024-00001
  requisitionId: uuid('requisition_id').references(() => purchaseRequisitions.id),
  supplierId: uuid('supplier_id'),
  status: text('status').default('draft').notNull(), // draft, sent, acknowledged, received, cancelled
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('INR').notNull(),
  expectedDelivery: date('expected_delivery'),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Service
File: `backend/src/modules/procurement/service.ts`

The auto-numbering logic (`PR-${year}-00001`) must move into the service:
```typescript
private async generateRequisitionNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await this.db.select({ count: count() })
    .from(purchaseRequisitions)
    .where(and(eq(purchaseRequisitions.agencyId, this.agencyId), like(purchaseRequisitions.requisitionNumber, `PR-${year}-%`)));
  return `PR-${year}-${String(Number(count[0].count) + 1).padStart(5, '0')}`;
}
```

---

## Module 5: Reports

### Context
Read `backend/src/routes/reports.js` and `backend/src/services/reportBuilderService.js`.

Reports is the only module where BullMQ jobs are central (not optional). Generated reports should be:
1. Triggered via POST (creates a BullMQ job)
2. Polled or pushed via WebSocket when complete

### Schema
File: `backend/src/modules/reports/schema.ts`

```typescript
export const reportDefinitions = pgTable('report_definitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // sales, hr, financial, inventory, custom
  config: jsonb('config').default({}).notNull(), // filters, groupBy, columns
  schedule: text('schedule'), // cron expression for scheduled reports
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reportRuns = pgTable('report_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }).notNull(),
  reportDefinitionId: uuid('report_definition_id').references(() => reportDefinitions.id),
  status: text('status').default('queued').notNull(), // queued, running, completed, failed
  outputUrl: text('output_url'), // MinIO URL when complete
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### Jobs
File: `backend/src/modules/reports/jobs.ts`

```typescript
export const REPORTS_QUEUE = 'reports';
export const reportJobs = {
  GENERATE_REPORT: 'generate-report',
  EXPORT_EXCEL: 'export-excel',
  SCHEDULED_REPORT: 'scheduled-report',
};
export interface GenerateReportPayload {
  reportDefinitionId: string;
  reportRunId: string;
  agencyId: string;
  filters: Record<string, unknown>;
  format: 'pdf' | 'xlsx' | 'csv';
}
// Define payload types only — workers are a separate implementation phase
```

### Routes
Prefix: `/api/reports`
- `GET /definitions` — list saved report definitions
- `POST /definitions` — save a report definition
- `POST /run` — trigger report generation (creates BullMQ job, returns runId)
- `GET /runs/:runId` — check run status + download URL
- `GET /runs` — list recent runs

---

## Implementation Order

Do them in this order — each is independent:

1. **Projects** (has existing Drizzle schema — fastest)
2. **Inventory** (write schema from inventoryService.js SQL, then service + routes)
3. **Finance** (read 3 old services, write schema + split service)
4. **Procurement** (read old service, write schema + service)
5. **Reports** (schema + jobs stubs + routes)

---

## After Each Module

Run `cd backend && npx tsc --noEmit` — must pass before moving to the next module.

Register the module in `backend/src/server.ts` if not already registered.

---

## Definition of Done (Phase 2)

- All 5 modules have 7 files
- All use Drizzle ORM — zero raw SQL
- All use Fastify plugin pattern — zero Express
- All use `request.agencyDb` — zero manual Pool creation
- `tsc --noEmit` passes with zero errors
- `agencyId` appears in every DB query

---

## Files to Read First (in order)

1. `backend/src/modules/crm/service.ts` — your template
2. `backend/src/modules/crm/routes.ts` — your template
3. `backend/src/infrastructure/database/schemas/projects.ts` — projects schema source
4. `backend/src/services/inventoryService.js` — extract warehouse + product table structure
5. `backend/src/services/procurementService.js` — extract requisition + PO table structure
6. `backend/src/services/bankReconciliationService.js` — extract finance table structure
7. `backend/src/routes/financial.js` — see all finance endpoints
8. `backend/src/routes/inventory.js` — see all inventory endpoints
9. `backend/src/routes/procurement.js` — see all procurement endpoints
10. `backend/src/routes/reports.js` — see all report endpoints

**Do NOT read files outside this list unless you hit an unresolvable import error.**
