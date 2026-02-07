# BuildFlow Database

## Main database vs agency databases

- **Main database (`buildflow_db`)**: Control plane only. Tenant catalog, platform config, page catalog, system identity. See [Main DB Multi-Tenant Plan](.cursor/plans/) for the 12 tables.
- **Agency databases**: One PostgreSQL database per agency (e.g. `agency_acme_a1b2c3d4`). Created by the backend when an agency is created; schema from `backend/src/utils/schemaCreator.js` (53 tables per agency).

**Migrations in this folder:**

| Migration | Applies to | Purpose |
|-----------|------------|---------|
| 01_core_schema.sql | Main DB only | agencies, users, profiles, user_roles, audit_logs |
| 09_system_health_metrics.sql | Main DB only | system_health_metrics (optional) |
| 10_page_catalog_schema.sql | Main DB only | page_catalog, agency_page_assignments, etc. |
| 11_seed_page_catalog.sql | Main DB only | Seed data for page_catalog |
| 12_system_settings_schema.sql | Main DB only | system_settings |
| 13_create_super_admin.sql | Main DB only | Super admin user/role |
| 14_remove_super_admin_from_agencies.sql | Main DB only | Cleanup super_admin in main DB |
| 15_enhance_system_settings.sql | Main DB only | system_settings enhancements |
| 16_agency_provisioning_jobs.sql | Main DB only | Async agency creation jobs (202 + poll) |
| 02–07, add_quotation_agency_columns.sql | Agency DBs or legacy | Not run by main DB init; used by schemaCreator or manual runs |

Main DB init (backend startup) runs: 01, then notifications (code), then 10+11, then 12, then 09, then 16 (agency_provisioning_jobs), then ensureSuperAdminUser. Do not run 02 (departments) on main DB—departments is an agency table.

---

## First-time setup (PostgreSQL just installed)

### 1. Start PostgreSQL

**Windows (run as Administrator):**
```powershell
# Find your PostgreSQL service name (e.g. postgresql-x64-15)
Get-Service -Name *postgres*

# Start it
Start-Service postgresql-x64-15
```

Or use **Services** (Win+R → `services.msc`) and start the **PostgreSQL** service.

**macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### 2. Create the database

From the **backend** folder:

```bash
npm run db:create
```

Or:

```bash
node src/scripts/create-database.js
```

This creates the `buildflow_db` database. The backend will create tables automatically on first start (from `database/migrations/01_core_schema.sql`).

### 3. Connection (from .cursor/rules)

- **Database:** buildflow_db  
- **User:** postgres  
- **Password:** admin  
- **URL:** `postgresql://postgres:admin@localhost:5432/buildflow_db`

To use a different password, set `DATABASE_URL` in the backend `.env` or `PGPASSWORD` when running the script.

### Optional: create DB with psql

If you have `psql` in PATH:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE buildflow_db;"
```

(Enter the postgres user password when prompted.)
