/**
 * Default modules enabled for new workspaces
 * These are the baseline modules every agency needs to get started
 */

export interface StarterModuleConfig {
  name: string;
  enabled: boolean;
  description: string;
}

export const STARTER_MODULES: StarterModuleConfig[] = [
  {
    name: 'core',
    enabled: true,
    description: 'Authentication, users, settings',
  },
  {
    name: 'dashboard',
    enabled: true,
    description: 'Workspace overview and analytics',
  },
  {
    name: 'crm',
    enabled: true,
    description: 'Clients, leads, deals management',
  },
  {
    name: 'hr',
    enabled: false,
    description: 'Employees, attendance, leave',
  },
  {
    name: 'finance',
    enabled: false,
    description: 'Invoices, payments, ledger',
  },
  {
    name: 'inventory',
    enabled: false,
    description: 'Products, stock, warehouses',
  },
  {
    name: 'projects',
    enabled: false,
    description: 'Tasks, milestones, time tracking',
  },
  {
    name: 'procurement',
    enabled: false,
    description: 'Purchase orders, suppliers',
  },
  {
    name: 'reports',
    enabled: false,
    description: 'Report builder, exports',
  },
];

export function getStarterModules(): StarterModuleConfig[] {
  return STARTER_MODULES;
}
