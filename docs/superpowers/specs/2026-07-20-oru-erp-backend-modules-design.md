# ORU ERP — Backend Module Migration Design

**Date:** 2026-07-20  
**Status:** Approved — ready for implementation  
**Team:** Solo dev + AI agent (Antigravity)

---

## Goal

Migrate `backend/src/` from a flat structure (30+ services, 30+ route files) to a **collocated modular structure** where each domain module is a sealed unit: `schema + service + routes + types + abilities + jobs + index`.

No existing functionality should break. Migration is additive — new module files are created, old flat files are deleted only after the module is confirmed working.

---

## Current State (as of 2026-07-20)

### What exists in `backend/src/`
```
modules/
  auth/       ← 4 files: service.ts, abilities.ts, schemas.ts, routes.ts (MOST COMPLETE)
  crm/        ← routes.ts only (DB queries inline — WRONG pattern, needs service)
  hr/         ← routes.ts only
  agencies/   ← unknown state
  catalog/    ← unknown state
  database/   ← unknown state
  inventory/  ← unknown state
  monitoring/ ← unknown state
  notifications/ ← unknown state
  plans/      ← unknown state
  projects/   ← unknown state
  storage/    ← unknown state
  system/     ← unknown state

services/     ← 30+ flat .js files (the actual business logic)
routes/       ← 30+ flat .js route files

infrastructure/database/schemas/  ← per-module schema files (SOURCE OF TRUTH)
  agency.ts, auth.ts, crm.ts, hr.ts, inventory.ts, projects.ts, notifications.ts,
  plans.ts, monitoring.ts, catalog.ts, provisioning.ts, tickets.ts, users.ts, enums.ts
```

### Key pattern problems in current code
1. `crm/routes.ts` — DB queries directly in route handlers (must move to service)
2. `auth/service.ts` — takes `FastifyInstance` as constructor param (should take `db` instance + agencyId)
3. Routes use `db` imported from infrastructure directly instead of injected
4. All files are `.js` in `services/` and `routes/` (need to port to `.ts`)

---

## Target Module Structure

Every module at `backend/src/modules/<name>/` must have exactly these 7 files:

```
modules/crm/
  schema.ts     ← Copy from infrastructure/database/schemas/crm.ts, then DELETE the old one
  service.ts    ← All business logic. Constructor: (db: AgencyDb, agencyId: string)
  routes.ts     ← Thin handlers only. Import service, call methods, return response.
  types.ts      ← TypeScript interfaces for this module's domain objects
  abilities.ts  ← CASL ability definitions: what subjects + actions this module owns
  jobs.ts       ← BullMQ job definitions (only if module has background work)
  index.ts      ← Barrel: export only what other modules need via shared/
```

---

## Module → Domain Mapping

| Module | Backend prefix | Owns (from flat services) |
|--------|---------------|---------------------------|
| `core` | `/api/auth`, `/api/users`, `/api/settings` | authService, settingsService, sessionManagementService, passwordPolicyService, encryptionService, twoFactorService, ssoService, apiKeyService, cacheService |
| `crm` | `/api/crm` | leadScoringService (partial), crmEnhancements route |
| `hr` | `/api/hr` | departmentService, (attendance/leave in DB schema) |
| `projects` | `/api/projects` | ganttService, projectEnhancements route |
| `finance` | `/api/finance` | bankReconciliationService, budgetService, financial route |
| `inventory` | `/api/inventory` | inventoryService, assetManagementService |
| `procurement` | `/api/procurement` | procurementService |
| `reports` | `/api/reports` | reportBuilderService, scheduledReportService, reportingDashboardService |
| `admin` | `/api/admin` | agencyService, agencyDeleteService, agencyExportService, backupService, databaseOptimizationService, integrationService, webhookService, workflowService |
| `notifications` | `/api/notifications` | emailService (→ Resend), notifications module |

---

## Service Pattern (CANONICAL — use this exact pattern)

```typescript
// modules/crm/service.ts
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, ilike, or } from 'drizzle-orm';
import { clients, leads } from './schema.js';
import type { NewClient, Client, ClientFilters } from './types.js';

export class CrmService {
  constructor(
    private db: NodePgDatabase<any>,
    private agencyId: string,
  ) {}

  async getClients(filters: ClientFilters): Promise<Client[]> {
    const conditions = [eq(clients.agencyId, this.agencyId)];
    if (filters.status) conditions.push(eq(clients.status, filters.status));
    if (filters.search) {
      conditions.push(or(
        ilike(clients.name, `%${filters.search}%`),
        ilike(clients.email, `%${filters.search}%`),
      ));
    }
    return this.db.select().from(clients).where(and(...conditions));
  }

  async getClientById(id: string): Promise<Client> {
    const [client] = await this.db
      .select().from(clients)
      .where(and(eq(clients.id, id), eq(clients.agencyId, this.agencyId)));
    if (!client) throw new Error('Client not found');
    return client;
  }

  async createClient(data: NewClient): Promise<Client> {
    const [client] = await this.db
      .insert(clients)
      .values({ ...data, agencyId: this.agencyId })
      .returning();
    return client;
  }
}
```

**Rules:**
- Constructor always takes `(db, agencyId)` — never `FastifyInstance`
- agencyId is ALWAYS enforced in every query (multi-tenancy)
- Return typed domain objects, never raw DB rows
- Throw named errors (`new Error('Not found')`, `new ForbiddenError(...)`)
- No HTTP concepts (no `request`, no `reply`)

---

## Route Pattern (CANONICAL — use this exact pattern)

```typescript
// modules/crm/routes.ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { CrmService } from './service.js';
import { ForbiddenError } from '../../shared/errors.js';

const clientFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const crmRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/clients', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('read', 'Client')) throw new ForbiddenError();
    const agencyDb = request.agencyDb; // injected by dbPlugin
    const agencyId = request.user.agencyId;
    const filters = clientFiltersSchema.parse(request.query);

    const service = new CrmService(agencyDb, agencyId);
    const data = await service.getClients(filters);
    return { success: true, data };
  });

  fastify.post('/clients', { onRequest: [fastify.authenticate] }, async (request) => {
    if (request.ability.cannot('create', 'Client')) throw new ForbiddenError();
    const agencyDb = request.agencyDb;
    const agencyId = request.user.agencyId;
    const service = new CrmService(agencyDb, agencyId);
    const client = await service.createClient(request.body as any);
    return { success: true, data: client };
  });
};

export default crmRoutes;
```

**Rules:**
- Routes are thin: parse → instantiate service → call method → return
- Instantiate service per-request (passes per-request agencyDb + agencyId)
- All validation via Zod (inline or imported from `packages/schemas/<module>/`)
- CASL check before every operation
- Return `{ success: true, data: ... }` shape always

---

## Schema Pattern (CANONICAL)

```typescript
// modules/crm/schema.ts
// Copy from infrastructure/database/schemas/crm.ts verbatim.
// Then update imports to be relative within module.
// After all references to this module's schema use the new path, delete the old file.
export { clients, leads, crmActivities, clientContacts } from './schema.js';
```

Migration rule: **Do NOT delete `infrastructure/database/schemas/<module>.ts` until every import across the codebase points to the new module path.**

---

## Types Pattern (CANONICAL)

```typescript
// modules/crm/types.ts
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { clients, leads } from './schema.js';

export type Client = InferSelectModel<typeof clients>;
export type NewClient = InferInsertModel<typeof clients>;
export type Lead = InferSelectModel<typeof leads>;
export type NewLead = InferInsertModel<typeof leads>;

export interface ClientFilters {
  status?: 'active' | 'inactive' | 'prospect';
  search?: string;
  page?: number;
  limit?: number;
}
```

Use `InferSelectModel` / `InferInsertModel` from drizzle-orm — never hand-write interface shapes that duplicate DB schema.

---

## Abilities Pattern (CANONICAL)

```typescript
// modules/crm/abilities.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { UserRole } from '../../shared/types.js';

export function defineCrmAbilities(role: UserRole) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (role === 'admin') {
    can('manage', 'Client');
    can('manage', 'Lead');
    can('manage', 'Deal');
  } else if (role === 'manager') {
    can(['read', 'create', 'update'], 'Client');
    can(['read', 'create', 'update'], 'Lead');
    cannot('delete', 'Client');
  } else {
    can('read', 'Client');
    can('read', 'Lead');
  }

  return build();
}
```

---

## Index Pattern (CANONICAL)

```typescript
// modules/crm/index.ts
// Only export what other modules legitimately need via shared/
// Internal service implementation is NOT exported
export type { Client, Lead, Deal } from './types.js';
export { crmRoutes } from './routes.js';
```

---

## Jobs Pattern (CANONICAL — only if module needs background work)

```typescript
// modules/finance/jobs.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '../../infrastructure/redis/index.js';

export const financeQueue = new Queue('finance', { connection: redis });

export function startFinanceWorker() {
  return new Worker('finance', async (job) => {
    if (job.name === 'generatePayroll') {
      // call FinanceService methods here
    }
    if (job.name === 'generateInvoicePdf') {
      // Playwright PDF generation
    }
  }, { connection: redis });
}
```

---

## Migration Order (implement in this exact sequence)

Safest order: start with modules that have the least cross-cutting dependencies.

### Phase 1 — Foundation (no deps on other modules)
1. **`core/auth`** — already 90% done (service + abilities + schemas + routes exist). Fix constructor pattern (remove FastifyInstance, use db injection). Convert schemas.ts → types.ts + schema.ts pattern.
2. **`notifications`** — isolated, just email + DB notifications table.

### Phase 2 — Single-domain modules (depend only on core)
3. **`hr`** — has DB schema. Migrate departmentService.js → service.ts. Port routes.ts to service pattern.
4. **`crm`** — has DB schema. Move inline DB queries from routes.ts → new service.ts.
5. **`inventory`** — migrate inventoryService.js.

### Phase 3 — Cross-referencing modules
6. **`projects`** — migrate ganttService.js, projectEnhancements route.
7. **`finance`** — migrate bankReconciliationService, budgetService, financial route. Add BullMQ jobs for payroll + PDF.
8. **`procurement`** — migrate procurementService.js.

### Phase 4 — Platform modules
9. **`reports`** — migrate reportBuilderService, scheduledReportService. Add BullMQ jobs for report generation.
10. **`admin`** — migrate agencyService, agencyDeleteService, agencyExportService. (Last because it touches all other modules via shared/ only.)

---

## Server Registration Pattern

`backend/src/server.ts` registers each module's routes using `@fastify/autoload` or explicit plugin registration:

```typescript
// server.ts — add per module
import { crmRoutes } from './modules/crm/routes.js';
import { hrRoutes } from './modules/hr/routes.js';

fastify.register(crmRoutes, { prefix: '/api/crm' });
fastify.register(hrRoutes, { prefix: '/api/hr' });
```

Pattern: each module's routes.ts exports a `FastifyPluginAsync`. Server registers it with its prefix. No route file should define its own prefix.

---

## Files NOT to Touch During Migration

- `backend/src/plugins/` — auth, casl, swagger plugins stay
- `backend/src/infrastructure/` — keep until all schema imports migrated
- `backend/src/server.ts` — only ADD new module registrations, don't remove old routes until module confirmed working
- `backend/src/utils/` — shared utilities stay in place

---

## Definition of Done (per module)

A module is complete when:
- [ ] `schema.ts` exists and exports all tables owned by this module
- [ ] `service.ts` exists with constructor `(db, agencyId)` — no `FastifyInstance`
- [ ] `routes.ts` is thin — zero DB queries, all logic in service
- [ ] `types.ts` exists using `InferSelectModel`/`InferInsertModel`
- [ ] `abilities.ts` defines CASL subjects for this module
- [ ] `index.ts` exports only public surface
- [ ] Old flat service file from `services/` is deleted
- [ ] Old flat route file from `routes/` is deleted or redirected
- [ ] All TypeScript types check with `tsc --noEmit`
- [ ] API routes return same shape as before (no frontend breakage)
