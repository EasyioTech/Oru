/**
 * Agency Provisioning Sub-Module
 * Provides atomic, reproducible creation and baseline configuration for Oru ERP tenants.
 */

export { provisionNewAgency, type ProvisionAgencyInput, type ProvisionAgencyResult } from './agency-provisioner.js';
export { INDIAN_ERP_DEFAULTS, type DefaultAgencySettingsConfig } from './default-settings.js';
export { BASELINE_STARTER_MODULES, buildStarterModulesPayload, type ModuleDescriptor } from './starter-modules.js';
export { sanitizeDomainSlug, resolveUniqueDomainSlug } from './domain-slug.js';
