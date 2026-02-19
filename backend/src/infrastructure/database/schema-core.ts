
import * as enums from './schemas/enums.js';
import * as publicSchema from './schemas/public.js';
import * as users from './schemas/users.js';
import * as agency from './schemas/agency.js';
import * as auth from './schemas/auth.js';
import * as system from './schemas/system.js';
import * as monitoring from './schemas/monitoring.js';
import * as provisioning from './schemas/provisioning.js';
import * as catalog from './schemas/catalog.js';
import * as plans from './schemas/plans.js';
import * as features from './schemas/features.js';

export const schema = {
    ...enums,
    ...publicSchema,
    ...users,
    ...agency,
    ...auth,
    ...system,
    ...monitoring,
    ...provisioning,
    ...catalog,
    ...plans,
    ...features
};

// Also export everything for individual imports
export * from './schemas/enums.js';
export * from './schemas/public.js';
export * from './schemas/users.js';
export * from './schemas/agency.js';
export * from './schemas/auth.js';
export * from './schemas/system.js';
export * from './schemas/monitoring.js';
export * from './schemas/provisioning.js';
export * from './schemas/catalog.js';
export * from './schemas/plans.js';
export * from './schemas/features.js';
