
// Full Blueprint for Agency (Child) Databases
export * from './schemas/enums.js';
export * from './schemas/public.js';
export * from './schemas/users.js';
export * from './schemas/agency.js';
export * from './schemas/auth.js';
export * from './schemas/catalog.js';

// Module Specific Tables
export * from './schemas/crm.js';
export * from './schemas/projects.js';
export * from './schemas/tickets.js';
export * from './schemas/notifications.js';

// NOT IN TENANT:
// - provisioning.js (Platform jobs)
// - plans.js (Global Pricing)
// - features.js (Global System Features)
// - monitoring.js (Platform Health)
// - system.js (Global Settings)
