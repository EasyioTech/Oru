/**
 * Default Workspace Modules for New Tenants
 * Ensures every newly created agency has all standard ERP operational modules enabled out of the box.
 */

export interface ModuleDescriptor {
  name: string;
  enabled: boolean;
  description?: string;
}

export const BASELINE_STARTER_MODULES: ModuleDescriptor[] = [
  { name: 'core', enabled: true, description: 'Authentication, users, permissions, audit' },
  { name: 'dashboard', enabled: true, description: 'Workspace analytics and overview' },
  { name: 'crm', enabled: true, description: 'Client CRM, leads, pipelines, deals' },
  { name: 'projects', enabled: true, description: 'Projects, tasks, milestones, time tracking' },
  { name: 'finance', enabled: true, description: 'Invoices, payments, GST, ledger, Indian taxation' },
  { name: 'hr', enabled: true, description: 'Employee records, attendance, payroll, leave' },
  { name: 'inventory', enabled: true, description: 'Products, stock levels, warehouses' },
  { name: 'procurement', enabled: true, description: 'Purchase orders, vendors, quotations' },
  { name: 'reports', enabled: true, description: 'Custom reports, exports, operational intelligence' },
];

/**
 * Builds dual-format modules payload compatible with both:
 * 1. TanStack WorkspaceContext (expects active/available arrays)
 * 2. Backend Capabilities Engine (expects object keys per module name)
 */
export function buildStarterModulesPayload() {
  const active = BASELINE_STARTER_MODULES.filter((m) => m.enabled).map((m) => ({
    name: m.name,
    enabled: true,
  }));

  const available = BASELINE_STARTER_MODULES.map((m) => ({
    name: m.name,
    enabled: m.enabled,
  }));

  const keyedObject: Record<string, { enabled: boolean; available: boolean }> = {};
  for (const m of BASELINE_STARTER_MODULES) {
    keyedObject[m.name] = { enabled: m.enabled, available: true };
  }

  return {
    active,
    available,
    disabled: [],
    ...keyedObject,
  };
}
