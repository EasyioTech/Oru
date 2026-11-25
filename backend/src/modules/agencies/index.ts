export { AgenciesService } from './service.js';
export {
  provisionNewAgency,
  type ProvisionAgencyInput,
  type ProvisionAgencyResult,
  INDIAN_ERP_DEFAULTS,
  BASELINE_STARTER_MODULES,
  buildStarterModulesPayload,
  sanitizeDomainSlug,
  resolveUniqueDomainSlug,
} from './provisioning/index.js';
export type { Agency, AgencyMetrics } from './types.js';
