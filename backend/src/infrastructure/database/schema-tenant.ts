
// Full Blueprint for Agency (Child) Databases
// Tenant DBs contain ONLY operational data for that agency.
// Platform governance tables (plans, features, catalog, monitoring, system) live ONLY in the platform DB.
export * from './schemas/enums.js';
export * from './schemas/public.js';       // currencies (seeded reference data)
export * from './schemas/users.js';        // users (synced from platform)
export * from './schemas/agency.js';       // agencies + agency_settings
export * from './schemas/auth.js';         // user_sessions, profiles, user_roles, tokens

// Tenant Operational Tables
export * from './schemas/crm.js';
export * from './schemas/projects.js';
export * from './schemas/tickets.js';
export * from './schemas/notifications.js';

// NOT IN TENANT (platform-only):
// - plans.js         (subscription_plans — global pricing)
// - features.js      (system_features — global feature flags)
// - catalog.js       (page_catalog, page_* — SaaS feature catalog)
// - provisioning.js  (agency_provisioning_jobs — platform control plane)
// - monitoring.js    (platform health)
// - system.js        (global settings)
