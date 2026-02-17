# Main (Global) System Migrations

This directory contains the core schema and seed data for the **Oru ERP Control Plane (Main Database)**.

## Architecture Overview
The system follows a multi-tenant architecture with a clear separation between the **Control Plane** and the **Data Plane (Tenants)**:

1. **Main Database (`oru`)**:
   - Manages global entities: Agencies, Users (Super Admins), System Settings.
   - Handles the Page Catalog and Subscription/Provisioning logic.
   - Monitors per-agency stats and system health.
   - **Do not** add tenant-specific business data here (e.g., Quotations, Financials).

2. **Agency Databases (Tenant-specific)**:
   - Isolated databases created per agency during provisioning.
   - Contain the full ERP business logic (HR, CRM, Financials, Documents, etc.).
   - Schema is managed via JS-based orchestrators in `src/infrastructure/database/schema/`.

## Migration Sequence
The scripts in this directory are ordered to satisfy dependencies:

- `01_core_system.sql`: Agencies, Global Users, Profiles, Currencies.
- `02_system_monitoring.sql`: Health metrics, Alerts, Incidents.
- `03_catalog_management.sql`: Page catalog, Pricing tiers, Agency assignments.
- `04_seed_catalog.sql`: Default pages and recommendation rules.
- `05_system_settings.sql`: Global branding, SMTP, API, and Security settings.
- `06_super_admin.sql`: Seeds the initial Super Administrator account.
- `07_provisioning_logic.sql`: Logic for tracking background agency database creation.

## Usage
To recreate the main database from scratch:
```powershell
node src/scripts/create-database.js
node src/scripts/migrate-main.js
```
