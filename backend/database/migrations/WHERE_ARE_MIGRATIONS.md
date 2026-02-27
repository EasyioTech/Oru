# Migration Files

All migration SQL files are in this directory: `database/migrations/`.

**Which migrations run where:** See [database/README.md](../README.md) for:

- Main database (`buildflow_db`) vs agency databases
- Which files are applied by the backend on startup
- Which files are for agency DBs or manual use

**Main DB init order (backend):** 01_core_schema → notifications (code) → 10_page_catalog + 11_seed → 12_system_settings → 09_system_health_metrics → ensureSuperAdminUser.

**Creating the database:** From backend folder run `npm run db:create` (see database/README.md).
