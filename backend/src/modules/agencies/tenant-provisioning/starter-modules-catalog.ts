/**
 * Starter Modules Catalog for Oru ERP
 * Provides complete dual-format module payloads enabling all 9 core ERP modules:
 * - core
 * - dashboard
 * - crm
 * - projects
 * - finance
 * - hr
 * - inventory
 * - procurement
 * - reports
 */

export interface StarterModuleItem {
  name: string;
  enabled: boolean;
  tier?: string;
  description?: string;
}

export const STARTER_MODULES_LIST: StarterModuleItem[] = [
  { name: 'core', enabled: true, tier: 'starter', description: 'Core system workspace and user directory' },
  { name: 'dashboard', enabled: true, tier: 'starter', description: 'Real-time KPIs, executive summaries and margin gauges' },
  { name: 'crm', enabled: true, tier: 'starter', description: 'Client CRM, pipeline management, activities, and communication' },
  { name: 'projects', enabled: true, tier: 'starter', description: 'Project boards, task tracking, milestones, and timesheets' },
  { name: 'finance', enabled: true, tier: 'starter', description: 'Indian GST invoicing, e-way bills, ITC match, and ledger accounting' },
  { name: 'hr', enabled: true, tier: 'starter', description: 'Employee records, attendance, payroll, and leave management' },
  { name: 'inventory', enabled: true, tier: 'starter', description: 'Multi-warehouse stock, batch tracking, and valuation' },
  { name: 'procurement', enabled: true, tier: 'starter', description: 'Purchase orders, vendor quotes, and goods receipt tracking' },
  { name: 'reports', enabled: true, tier: 'starter', description: 'Financial statements, tax audits, and operational BI reports' },
];

export function buildStarterModulesPayload(): Record<string, any> {
  const keyedModules: Record<string, { enabled: boolean; tier: string }> = {};
  for (const mod of STARTER_MODULES_LIST) {
    keyedModules[mod.name] = { enabled: true, tier: mod.tier || 'starter' };
  }

  return {
    ...keyedModules,
    active: STARTER_MODULES_LIST.map((m) => ({ name: m.name, enabled: true })),
    available: [],
    disabled: [],
  };
}
