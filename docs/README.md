# BuildFlow Documentation

## Where to find what

| Topic | Location |
|-------|----------|
| **Architecture (multi-tenant, auth, routing)** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Database setup, migrations, main vs agency DBs** | [../database/README.md](../database/README.md) |
| **Backend API, structure, running** | [../backend/README.md](../backend/README.md) |
| **Operational runbooks, deployment, fixes** | [../do/](../do/) folder (e.g. CLEAN_START_GUIDE.md, VPS_FIX_*.md). Note: `do/.dockerignore.optimized` is reference only; Docker uses `backend/.dockerignore`. |

## Best practices (this project)

- **Validation**: Domain/agency name rules live in backend (`backend/src/services/agency/agencyDomainService.js`). Frontend (`frontend/src/components/onboarding/utils/validation.ts`) mirrors them for instant UX—keep both in sync when changing rules.
- **Database**: Always use parameterized queries; never string-concatenate SQL. Main DB = control plane only; agency data lives in per-agency databases.
- **Auth**: Super admin logs in without `domain`; agency users send `domain` in the login body for O(1) routing.

### Validation sync (frontend ↔ backend)

| Rule | Frontend (validation.ts) | Backend (agencyDomainService.js) |
|------|---------------------------|----------------------------------|
| Domain length | DOMAIN_CONSTRAINTS 3–63 | MIN_SUBDOMAIN_LENGTH 3, MAX 63 |
| Name length | NAME_CONSTRAINTS 2–100 | validateAgencyName 2–100 |
| Reserved words | RESERVED_SUBDOMAINS (subset) | RESERVED_SUBDOMAINS (full list) |
| Blocked terms | BLOCKED_TERMS_PARTIAL (minimal) | BLOCKED_TERMS (full) |

Backend is source of truth; frontend subset is for instant UX. When changing rules, update both.

---

## End-to-end test checklist

Run through these after setup to verify the full flow:

1. **Database**: From `backend/` run `npm run db:create` (or ensure `oru_erp` exists). Start backend; confirm main DB tables and migrations apply (including `agency_provisioning_jobs`), and super admin is created (logs: "Super admin user created" or "verified").
2. **Super admin login**: Open app → Login with `super@buildflow.local` / `super123` (leave Workspace empty). Expect redirect to dashboard.
3. **Agency creation (async)**: As super admin, start agency onboarding → Step 1: enter agency name and workspace URL → validation (reserved words, length). Submit; expect 202 then polling "Provisioning agency..." until completion; then auto sign-in with workspace domain and redirect to agency dashboard.
4. **Idempotency**: Retry same agency create (same domain/email); expect either 200 with same agency (idempotent) or 202 with same jobId if still running.
5. **Agency user login**: Logout → Login with agency user; enter **Workspace** (agency domain, e.g. `youragency.com`) and credentials. Expect O(1) lookup and redirect.
6. **API**: `GET /health` → 200; `GET /api/agencies/validation-rules` → rules; `GET /api/agencies/check-domain?domain=test` → available/error; `GET /api/agencies/provisioning/:jobId` → 404 for invalid id, 200 with status for valid job.

After changes: run `npm run lint` (frontend) and fix any reported issues.
