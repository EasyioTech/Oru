# BuildFlow Architecture Overview

## Multi-tenant model

- **Main database (`buildflow_db`)**: Control plane only. 12 tables: tenant catalog (agencies), platform config (system_settings, page_catalog, agency_page_assignments), system identity (users, profiles, user_roles for super_admin), audit_logs, notifications, system_health_metrics.
- **Agency databases**: One PostgreSQL database per agency. All ERP data and agency users live in that agency’s DB. Schema created by `backend/src/utils/schemaCreator.js` (53 tables per agency).

## Routing and auth

- **Domain → database**: Every request that targets an agency resolves `domain` (or header) → `agencies.database_name` via a single indexed lookup. No full table scan.
- **Login**: Super admin: no `domain`, checked in main DB only. Agency users: must send `domain` in login body; one main-DB lookup + one agency-DB lookup. No iteration over all agencies.

## Where to read more

- **Database setup and migrations**: [database/README.md](../database/README.md)
- **Main DB vs agency migrations**: [database/README.md](../database/README.md#main-database-vs-agency-databases)
- **Backend API and structure**: [backend/README.md](../backend/README.md)
- **Detailed main-DB plan**: `.cursor/plans/` (Main DB Multi-Tenant Plan)

## Agency creation (async, idempotent)

- **POST /api/agencies/create**: Returns **202 Accepted** with `jobId`. Agency provisioning (DB create, schema, seed, user, main-DB registration) runs in the background. Long-running work is no longer tied to a single HTTP request; timeouts and retries are safer.
- **GET /api/agencies/provisioning/:jobId**: Poll for status (`pending` → `running` → `completed` or `failed`) and result/error. Frontend polls until completed or failed.
- **Idempotency**: Send header `Idempotency-Key` (e.g. `onboarding:{domain}:{email}`). Same key returns the same job: if already completed, 200 with result; if pending/running, 202 with same job id. Prevents duplicate agencies on retries.
- **Jobs table**: `agency_provisioning_jobs` in main DB (migration 16). No Redis required for the queue; worker runs in-process via `setImmediate`.

### Schema creation and scale

- **Current behavior:** New tenant provisioning runs full schema creation (22 phases, 147 tables, indexes, triggers, views) via `backend/src/utils/schemaCreator.js`. Schema auto-sync (Step 21) is **disabled** for the provisioning path; it only runs for repair and admin schema operations, so no runtime schema mutation during tenant creation.
- **Scale:** This is acceptable for tens to low hundreds of agencies. For thousands of agencies, concurrent provisioning can cause DDL contention and catalog bloat.
- **Future options (not implemented):** Pre-baked DDL (single or few SQL migration files run once per new DB); template DB (`CREATE DATABASE ... TEMPLATE` from a golden agency DB); phased provisioning (core tables at onboarding, rest via background job or admin action).

## Redis

- **Optional in development**: If Redis is unavailable, the backend logs "Redis not available, using in-memory cache fallback" and continues. Session/cache use in-memory store.
- **Production**: Use Redis for session and cache. Configure `REDIS_URL` (or host/port). For high availability and multiple backend instances, Redis is required so sessions and cache are shared.

## Validation (frontend vs backend)

- **Frontend** (`frontend/src/components/onboarding/utils/validation.ts`): Client-side validation for instant UX. Constants (domain 3–63 chars, name 2–100, reserved words) must match backend.
- **Backend** (`backend/src/services/agency/agencyDomainService.js`): Source of truth. Same rules; also checks DB availability and blocked terms.
- **Sync**: When changing domain/name rules, update both frontend constants and backend `agencyDomainService.js`.
