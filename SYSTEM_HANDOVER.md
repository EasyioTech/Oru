
# 🌌 ORU ERP - AI HANDOVER & ARCHITECTURE GUIDE

This document serves as the "Source of Truth" for the next AI agent or developer taking over. It explains the core architecture, provisioning flow, and current state.

---

## 🏗️ CORE ARCHITECTURE

### 1. Multi-Tenant Strategy
- **Isolation**: Each agency has its own **Physical PostgreSQL Database**.
- **Main DB**: Contains `agencies`, `users`, `system_settings`, and `page_catalog`.
- **Tenant DB**: A clone of the schema containing agency-specific data (`projects`, `clients`, `invoices`).
- **Connection Manager**: `backend/src/infrastructure/database/index.ts` handles dynamic routing to tenant databases.

### 2. File Size Enforcement (Strict < 500 Lines)
- Large services have been split into domain-specific sub-services.
- **Example**: `SystemService` is a facade delegating to:
  - `system-monitoring.service.ts`
  - `system-management.service.ts`
  - `system-agency.service.ts`

### 3. Background Jobs (BullMQ + Redis)
- **Provisioning**: Managed via `agency-provisioning` queue.
- **Processor**: `backend/src/jobs/processors/agency-provisioning.job.ts`.
- **Flow**: `Complete Setup API` -> `Queue Job` -> `Worker Clones Main DB Schema` -> `Worker Seeds Data`.

---

## 🚀 PROVISIONING FLOW (How it Works)

1.  **Request**: User hits `/api/agencies/complete-setup`.
2.  **Main DB Prep**: 
    - Sync/Create `user`.
    - Create `agency` record (status: `pending`).
    - Create `user_role` in Main DB with `agency_id` mapping.
3.  **Queue**: A job is added to BullMQ with agency details.
4.  **Worker Task**:
    - Creates a new DB: `agency_[subdomain]_db`.
    - Applies migrations from `backend/drizzle/` (The Blueprint).
    - Seeds the tenant DB with the **Admin User** and **Page Catalog**.
    - **Auto-links Pages**: Every new agency is automatically assigned all 52 modules.
5.  **Activation**: Once finished, agency status becomes `active`.

---

## 📁 DIRECTORY STRUCTURE

```text
backend/src/
├── infrastructure/      # DB Connection, Drizzle Schemas (Auth, User, Catalog)
├── modules/             # Business Logic (Fastify Routes + Services)
│   ├── agencies/       # Creation & Provisioning
│   ├── system/         # Admin Panel & Metrics (Refactored < 500 lines)
│   └── auth/           # JWT, Registration
├── jobs/                # BullMQ Workers (Provisioning Processor)
└── utils/               # Encryption, Case Transformation, Error Classes
```

---

## 🛠️ TEST CREDENTIALS (Handover Account)

A fresh agency has been provisioned for verification:

- **Domain**: `oru-admin.oru.erp`
- **Link**: [http://localhost:3000/login](http://localhost:3000/login) (Enter `oru-admin.oru.erp` as domain)
- **Email**: `admin@oru.erp`
- **Password**: `Password123!`
- **Role**: `agency_admin` (Full permissions `["*"]`)

---

## 🛑 KNOWN GOTCHAS for the next AI
1.  **Redis Cleanup**: If you get "Agency not found" worker errors, it means a job is stuck in Redis from a deleted agency. Run `tsx obliterate_queue.ts` to clear it.
2.  **CORS**: Configured in `server.ts`. Ensure `ALLOWED_ORIGINS` includes your local development ports.
3.  **ON CONFLICT**: Avoid `onConflictDoUpdate` on tables with partial unique indexes (like `user_roles`). Use explicit checks.

---

## 🤖 PROMPT FOR THE NEXT AGENT (GEMINI PRO HIGH)

> "I am taking over a Fastify + Drizzle ERP system. My goal is to maintain the **< 500 lines per file** rule and the **Multi-Tenant architecture**. 
> 
> Current Success: Provisioning is working, ghost jobs are cleared, and a test agency `oru-admin.oru.erp` is ready. 
> 
> Next Tasks:
> 1. Log in to the test agency and verify the navigation menu loads 52 pages.
> 2. Ensure NO CORS errors happen when navigating between modules.
> 3. Implement the missing `ProjectDetails` service logic following the split-service pattern.
> 4. ALWAYS use `mapToSnakeCase` for API responses to match the frontend expectations."
