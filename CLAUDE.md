# ORU ERP — Project Context for AI Agents

> **Living document.** Update this file whenever a library, pattern, or architectural decision changes.
> Every AI agent session reads this first. Keep it accurate, terse, and actionable.

---

## What This Is

**ORU ERP** — a multi-tenant, enterprise-grade ERP platform.
Stack: Fastify (Node.js/TypeScript) + React (Vite) + PostgreSQL (per-tenant DB) + Redis.
Architecture: **Modular Monolith** — one backend, one frontend, hard module boundaries.
Deployment: Docker Compose + Traefik. Domain: `oruerp.com`.

---

## Architecture — The Golden Rule

Every module is a **sealed unit**. No module imports from another module's internals.
Cross-module data flows through `shared/` kernel only.
Subdomain routing (e.g. `crm.oruerp.com`) is a Traefik illusion — one backend process serves all.

---

## Module Map

| Module | Subdomain | Owns |
|--------|-----------|------|
| `core` | oruerp.com | users, auth, agencies, notifications, settings, audit |
| `crm` | crm.oruerp.com | clients, leads, deals, activities, communications |
| `hr` | hr.oruerp.com | employees, departments, attendance, leave, recruitment |
| `projects` | projects.oruerp.com | projects, tasks, milestones, time tracking, files |
| `finance` | finance.oruerp.com | invoices, payments, ledger, GST, payroll, reimbursements |
| `inventory` | inventory.oruerp.com | products, warehouses, stock, transfers, BOM |
| `procurement` | procurement.oruerp.com | purchase orders, suppliers, approvals, quotations |
| `reports` | reports.oruerp.com | report builder, scheduled reports, exports |
| `admin` | admin.oruerp.com | super admin, platform control plane, provisioning |

---

## Backend Module Pattern (ALWAYS follow this)

Every backend module lives at `backend/src/modules/<name>/` with exactly:

```
modules/crm/
  schema.ts       ← Drizzle table definitions (owns its DB tables)
  service.ts      ← All business logic (no HTTP, no DB in routes)
  routes.ts       ← Fastify route handlers (thin — calls service only)
  types.ts        ← TypeScript types for this module
  abilities.ts    ← CASL permission definitions for this module
  jobs.ts         ← BullMQ job definitions (if module has background jobs)
  index.ts        ← Barrel: exports only what other modules need via shared/
```

**Service rules:**
- Services receive DB instance + agencyId as constructor params
- Services return typed objects, never raw DB rows
- Services call other services only via `shared/` imports, never direct cross-module

**Route rules:**
- Routes are thin: parse request → call service → return response
- All validation via Zod schema (imported from `packages/schemas/<module>/`)
- Auth + CASL checked via Fastify preHandler hooks

---

## Frontend Module Pattern (ALWAYS follow this)

Every frontend module lives at `frontend/src/modules/<name>/` with exactly:

```
modules/crm/
  pages/          ← Route-level components (one per page)
  components/     ← Module-specific components only
  hooks/          ← TanStack Query hooks (useClients, useCreateClient, etc.)
  store.ts        ← Zustand store for module-level client state
  routes.tsx      ← React Router route definitions for this module
  types.ts        ← Module-specific types (import from packages/types/ when shared)
  index.ts        ← Barrel: exports only what shell needs
```

**Hook rules:**
- All API calls go through TanStack Query hooks — never raw fetch in components
- Hook naming: `use<Resource>` (query), `useCreate<Resource>`, `useUpdate<Resource>`, `useDelete<Resource>`
- Zod schemas validate API responses at the hook level

**Component rules:**
- All UI uses shadcn/ui components as base
- No module imports components from another module
- Shared components live in `frontend/src/shared/components/`

---

## Tech Stack — Definitive List (2026)

### Frontend

| Library | Version | Role | Notes |
|---------|---------|------|-------|
| React | 18+ | UI framework | |
| Vite | 6+ | Build tool | |
| TypeScript | 5.x | Language | strict mode always |
| React Router | 7 | Routing | lazy-load per module |
| **shadcn/ui** | latest | Component system | copy-paste, Tailwind-native, AI-agent CLI support |
| **Tremor** | latest | KPI cards, charts | Free (Vercel), built on Recharts |
| **TanStack Table** | v9 | Data grids | headless, pairs with shadcn table |
| **Recharts** | v3 | Charts | underlies Tremor; use directly for custom charts |
| **TanStack Query** | v5 | Server state | ALL API calls go through this |
| **Zustand** | v5 | Global client state | sidebar, theme, selected org |
| **React Hook Form** | v8 | Forms | |
| **Zod** | v4 | Validation | shared with backend via packages/schemas/ |
| **nuqs** | latest | URL state | filters, pagination, tabs in URL |
| **cmdk** | latest | Command palette | ⌘K global search/navigation |
| **vaul** | latest | Drawer/sheet | mobile-friendly side panels |
| **date-fns** | v4 | Date handling | tree-shakeable, TypeScript-first |
| Tailwind CSS | v4 | Styling | |

### Backend

| Library | Version | Role | Notes |
|---------|---------|------|-------|
| Fastify | v5 | HTTP framework | |
| TypeScript | 5.x | Language | |
| Drizzle ORM | latest | Database ORM | already in use |
| drizzle-kit | latest | Migrations | `generate` + `migrate` only, never `push` in prod |
| **Zod** | v4 | Request validation | schema from packages/schemas/, shared with frontend |
| **drizzle-zod** | latest | Auto Zod from Drizzle | `createInsertSchema(table)` eliminates manual schemas |
| **BullMQ** | v5 | Background jobs | payroll, reports, emails, exports |
| **Bull Board** | latest | Job queue UI | mount at /admin/jobs |
| **React Email** | latest | Email templates | build emails as React components |
| **Resend** | latest | Email delivery | replaces raw nodemailer |
| Redis | 7 | Cache + BullMQ | already in stack |
| CASL | v6 | Authorization | already in use |
| **fastify-type-provider-zod** | latest | OpenAPI auto-gen from Zod | One Zod schema = validation + Swagger docs + TypeScript type — zero drift |
| **@fastify/websocket** | latest | Real-time WebSocket | Official plugin; push notifications to client without polling |
| **@fastify/rate-limit** | latest | Per-tenant rate limiting | Redis store enables per-agencyId limits; plan tiers get different quotas |
| **Playwright** | latest | HTML→PDF (invoices, reports) | 3ms warm render; CSS layouts work — use React Email templates → Playwright → PDF |
| **ExcelJS** | latest | Excel `.xlsx` export | MIT; BullMQ worker generates async, streams to MinIO |
| **Meilisearch** | latest | Full-text search | Rust, Docker, <150MB RAM, <5min setup; replaces `ILIKE` DB queries |
| **Pino v9** + `@opentelemetry/sdk-node` | latest | Structured logs + traces | Fastify already uses Pino — add OTel to get correlated trace IDs across async jobs |
| @fastify/autoload | latest | Module route loading | |
| fastify-plugin | latest | Plugin scope sharing | |

### Shared Packages (monorepo)

| Package | Path | Role |
|---------|------|------|
| `@oru/schemas` | packages/schemas/ | Zod schemas shared between frontend + backend |
| `@oru/types` | packages/types/ | TypeScript types shared between apps |

### Infrastructure (self-hosted, Docker)

| Service | Role | Notes |
|---------|------|-------|
| **MinIO** | File/object storage | S3-compatible; `@aws-sdk/client-s3` points at it — same code for prod S3 |
| **Meilisearch** | Full-text search | Rust, ~150MB RAM Docker container |
| **Redis 7** | Cache + BullMQ backend | Already in stack |
| **PostgreSQL 16** | Databases | Platform DB + per-agency DBs |

### Build & Tooling

| Tool | Role |
|------|------|
| pnpm workspaces | Package manager + monorepo |
| Turborepo | Build caching + task orchestration |

---

## Database Rules

- **Never use `drizzle-kit push` in production** — always `generate` then `migrate`
- Platform DB (`oru_erp`): users, auth, agencies, plans, features, monitoring
- Agency DBs: all operational data (per-tenant isolation)
- Schema files live inside their module: `modules/crm/schema.ts`
- Cross-module FK references go through `agencyId` only — no direct table joins across modules
- `drizzle-zod` generates insert/select Zod schemas automatically from Drizzle table definitions

---

## Background Jobs (BullMQ)

All async/heavy work goes through BullMQ queues — never block HTTP handlers.

| Queue | Jobs |
|-------|------|
| `finance` | payroll calculation, invoice generation, GST reports |
| `reports` | scheduled report generation, data exports |
| `notifications` | email sends, push notifications |
| `hr` | attendance calculations, leave balance updates |

Workers run as separate processes in production (scale independently from API).
Dev: workers co-located in same process for simplicity.

---

## AI Agent Instructions

### When adding a new module:
1. Create `backend/src/modules/<name>/` with all 7 files
2. Create `frontend/src/modules/<name>/` with all 7 folders/files
3. Add Zod schemas to `packages/schemas/<name>/`
4. Register routes in `backend/src/server.ts` (autoload handles it)
5. Add route group in `frontend/src/App.tsx`
6. Never break existing modules

### When editing existing code:
- Read `modules/<name>/schema.ts` first to understand data shape
- Use `drizzle-zod` `createInsertSchema`/`createSelectSchema` before writing Zod manually
- Check `modules/<name>/abilities.ts` before adding any new route (permissions must be defined)
- All new queries go through TanStack Query hooks in `hooks/`

### File size limits (hard rules):
- Service files: max 300 lines → split into sub-services if larger
- Route files: max 150 lines → each resource gets its own route file
- Component files: max 200 lines → extract sub-components
- Schema files: max 150 lines → split by domain entity

### Naming conventions:
- DB tables: `snake_case` plural (`leave_requests`, `purchase_orders`)
- TypeScript types: `PascalCase` (`LeaveRequest`, `PurchaseOrder`)
- Zod schemas: `camelCase` + `Schema` suffix (`leaveRequestSchema`)
- API routes: `kebab-case` (`/api/leave-requests`)
- React components: `PascalCase` (`LeaveRequestForm`)
- React hooks: `camelCase` starting with `use` (`useLeaveRequests`)
- Zustand stores: `camelCase` + `Store` suffix (`leaveStore`)

---

## What NOT to Do (Hard Prohibitions)

- Do NOT import from `modules/X/` inside `modules/Y/` — use `shared/` only
- Do NOT add business logic to route handlers — service layer only
- Do NOT use raw fetch/axios in React components — TanStack Query hooks only
- Do NOT write Zod schemas manually when `drizzle-zod` can generate them
- Do NOT add new npm packages without checking this file first
- Do NOT use `drizzle-kit push` in production
- Do NOT put DB queries in React components or route handlers
- Do NOT create files > 300 lines without splitting

---

## Routing Strategy

### Backend API prefix per module:
```
/api/auth/*          → core module
/api/users/*         → core module
/api/crm/*           → crm module
/api/hr/*            → hr module
/api/projects/*      → projects module
/api/finance/*       → finance module
/api/inventory/*     → inventory module
/api/procurement/*   → procurement module
/api/reports/*       → reports module
/api/admin/*         → admin module
```

### Frontend lazy-loaded route groups:
```
/                    → dashboard (core)
/crm/*               → CRM module (lazy)
/hr/*                → HR module (lazy)
/projects/*          → Projects module (lazy)
/finance/*           → Finance module (lazy)
/inventory/*         → Inventory module (lazy)
/procurement/*       → Procurement module (lazy)
/reports/*           → Reports module (lazy)
/admin/*             → Admin module (lazy)
/settings/*          → Settings (core)
```

Traefik routes `crm.oruerp.com` → same frontend → `/crm/*` path. One SPA, module feels like its own app.

---

## Monorepo Structure (Target)

```
oru/
  apps/
    backend/              ← Fastify app
      src/
        modules/          ← domain modules (schema + service + routes + types)
        shared/           ← kernel: auth, db, cache, notifications, events
        infrastructure/   ← database pool, redis, s3, email
        jobs/             ← BullMQ workers
        plugins/          ← Fastify plugins (auth, casl, swagger)
        server.ts
    frontend/             ← React SPA
      src/
        modules/          ← domain modules (pages + components + hooks + store)
        shared/           ← shell, layout, global components, navigation
        lib/              ← TanStack Query client, Zustand root
        App.tsx
  packages/
    schemas/              ← @oru/schemas — Zod schemas (shared)
    types/                ← @oru/types — TypeScript types (shared)
  pnpm-workspace.yaml
  turbo.json
  CLAUDE.md               ← this file
```

---

## Session Start Checklist (for AI agents)

1. Read this file (CLAUDE.md) — already loaded
2. Run `/claude-mem:mem-search "oru erp"` to pull recent session context
3. Check which module you're working in — read its `schema.ts` first
4. Check `abilities.ts` if adding routes
5. Follow module pattern exactly — no improvisation

---

*Last updated: 2026-07-20 | Architecture: Modular Monolith | Status: In active migration*
