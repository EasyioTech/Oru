/**
 * API Services - Central exports from feature-aligned subfolders
 * Import from @/services/api/<feature> for tree-shaking (e.g. @/services/api/core, @/services/api/auth)
 */

// Core (base, postgresql-service)
export * from './core';

// Auth (auth, auth-postgresql, twoFactor-service)
export * from './auth';

// Feature modules
export * from './departments';
export * from './projects';
export * from './procurement';
export * from './inventory';
export * from './assets';
export * from './reports';
export * from './workflows';
export * from './integrations';
export * from './crm';
export * from './financial';
export * from './hr';
export * from './selectors';
export * from './system';
export * from './employees';
export * from './audit';
export * from './agencies';
export * from './permissions';
export * from './storage';
