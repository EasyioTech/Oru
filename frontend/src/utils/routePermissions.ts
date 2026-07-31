import { AppRole, hasRoleOrHigher } from './roleUtils';

export interface RoutePermission {
  path: string;
  requiredRoles: AppRole[];
  allowHigherRoles: boolean;
  description?: string;
}

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // Public routes
  '/': { path: '/', requiredRoles: [], allowHigherRoles: false },
  '/pricing': { path: '/pricing', requiredRoles: [], allowHigherRoles: false },
  '/auth': { path: '/auth', requiredRoles: [], allowHigherRoles: false },
  '/agency-signup': { path: '/agency-signup', requiredRoles: [], allowHigherRoles: false },
  '/signup-success': { path: '/signup-success', requiredRoles: [], allowHigherRoles: false },
  '/forgot-password': { path: '/forgot-password', requiredRoles: [], allowHigherRoles: false },

  // Dashboards
  '/dashboard': { path: '/dashboard', requiredRoles: [], allowHigherRoles: false },
  '/agency': {
    path: '/agency',
    requiredRoles: ['agency_admin'],
    allowHigherRoles: true,
    description: 'Agency dashboard'
  },

  // View As User
  '/view-as-user': {
    path: '/view-as-user',
    requiredRoles: ['agency_admin'],
    allowHigherRoles: true,
    description: 'View dashboard as another user'
  },

  // Employee Management
  '/employee-management': {
    path: '/employee-management',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Employee management and administration'
  },
  '/create-employee': {
    path: '/create-employee',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Create new employee'
  },
  '/assign-user-roles': {
    path: '/assign-user-roles',
    requiredRoles: ['agency_admin'],
    allowHigherRoles: true,
    description: 'Assign roles to users'
  },
  '/employee-performance': {
    path: '/employee-performance',
    requiredRoles: [],
    allowHigherRoles: false,
    description: 'Employee performance tracking'
  },
  '/department-management': {
    path: '/department-management',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Department management'
  },

  // Project Management
  '/project-management': {
    path: '/project-management',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Project management interface'
  },
  '/projects': {
    path: '/projects',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Projects overview'
  },
  '/projects/:id': { path: '/projects/:id', requiredRoles: [], allowHigherRoles: false },
  '/tasks/:id': { path: '/tasks/:id', requiredRoles: [], allowHigherRoles: false },
  '/my-projects': {
    path: '/my-projects',
    requiredRoles: ['employee'],
    allowHigherRoles: true,
    description: 'Employee view of assigned projects'
  },
  // Settings
  '/settings': { path: '/settings', requiredRoles: [], allowHigherRoles: false },
  '/permissions': { path: '/permissions', requiredRoles: ['agency_admin'], allowHigherRoles: true },

  // HR Management
  '/attendance': {
    path: '/attendance',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Attendance management'
  },
  '/leave-requests': {
    path: '/leave-requests',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Leave request management'
  },
  '/holiday-management': {
    path: '/holiday-management',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Holiday calendar management'
  },
  '/role-requests': {
    path: '/role-requests',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Role change requests'
  },
  '/calendar': { path: '/calendar', requiredRoles: [], allowHigherRoles: false },

  // Personal pages

  '/my-attendance': { path: '/my-attendance', requiredRoles: [], allowHigherRoles: false },
  '/my-leave': { path: '/my-leave', requiredRoles: [], allowHigherRoles: false },
  '/notifications': { path: '/notifications', requiredRoles: [], allowHigherRoles: false },
  '/documents': { path: '/documents', requiredRoles: [], allowHigherRoles: false },
  '/ai-features': { path: '/ai-features', requiredRoles: [], allowHigherRoles: false },

  // Financial Management
  '/financial-management': {
    path: '/financial-management',
    requiredRoles: ['agency_admin'],
    allowHigherRoles: true,
    description: 'Financial management dashboard'
  },
  '/payroll': {
    path: '/payroll',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Payroll management'
  },
  '/invoices': {
    path: '/invoices',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Invoice management'
  },
  '/payments': {
    path: '/payments',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Payment tracking'
  },
  '/receipts': {
    path: '/receipts',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Receipt management'
  },
  '/ledger': {
    path: '/ledger',
    requiredRoles: ['agency_admin'],
    allowHigherRoles: true,
    description: 'General ledger'
  },
  '/ledger/create-entry': {
    path: '/ledger/create-entry',
    requiredRoles: ['agency_admin'],
    allowHigherRoles: true,
    description: 'Create journal entry'
  },
  '/reimbursements': { path: '/reimbursements', requiredRoles: [], allowHigherRoles: false },

  // Clients & CRM
  '/clients': { path: '/clients', requiredRoles: ['manager'], allowHigherRoles: true },
  '/clients/create': {
    path: '/clients/create',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Create new client'
  },
  '/clients/edit/:id': {
    path: '/clients/edit/:id',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'Edit client'
  },
  '/crm': {
    path: '/crm',
    requiredRoles: ['manager'],
    allowHigherRoles: true,
    description: 'CRM system'
  },
  '/crm/leads/:leadId': {
    path: '/crm/leads/:leadId',
    requiredRoles: ['manager'],
    allowHigherRoles: true
  },
  '/crm/activities/:activityId': {
    path: '/crm/activities/:activityId',
    requiredRoles: ['manager'],
    allowHigherRoles: true
  },

  // Reports & Analytics
  '/reports': {
    path: '/reports',
    requiredRoles: ['auditor'],
    allowHigherRoles: true,
    description: 'Reports dashboard'
  },
  '/reports/dashboard': { path: '/reports/dashboard', requiredRoles: ['auditor'], allowHigherRoles: true },
  '/reports/custom': { path: '/reports/custom', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/reports/scheduled': { path: '/reports/scheduled', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/reports/exports': { path: '/reports/exports', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/centralized-reports': {
    path: '/centralized-reports',
    requiredRoles: ['auditor'],
    allowHigherRoles: true,
    description: 'Centralized reporting'
  },

  // Inventory
  '/inventory': { path: '/inventory', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/products': { path: '/inventory/products', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/bom': { path: '/inventory/bom', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/serial-batch': { path: '/inventory/serial-batch', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/reports': { path: '/inventory/reports', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/settings': { path: '/inventory/settings', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/warehouses': { path: '/inventory/warehouses', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/stock-levels': { path: '/inventory/stock-levels', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/transfers': { path: '/inventory/transfers', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/inventory/adjustments': { path: '/inventory/adjustments', requiredRoles: ['agency_admin'], allowHigherRoles: true },

  // Workflows & Integrations
  '/workflows': { path: '/workflows', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/workflows/instances': { path: '/workflows/instances', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/workflows/approvals': { path: '/workflows/approvals', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/workflows/automation': { path: '/workflows/automation', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/workflows/settings': { path: '/workflows/settings', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/workflows/builder': { path: '/workflows/builder', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/integrations': { path: '/integrations', requiredRoles: ['agency_admin'], allowHigherRoles: true },
  '/integrations/settings': { path: '/integrations/settings', requiredRoles: ['agency_admin'], allowHigherRoles: true },

  // Super Admin (system-level only)
  '/super-admin': { path: '/super-admin', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/super-admin/agencies': { path: '/super-admin/agencies', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/super-admin/agencies/:id': { path: '/super-admin/agencies/:id', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/super-admin/agencies/:id/data': { path: '/super-admin/agencies/:id/data', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/super-admin/system-settings': { path: '/super-admin/system-settings', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/super-admin/plans': { path: '/super-admin/plans', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/super-admin/analytics': { path: '/super-admin/analytics', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/system-health': { path: '/system-health', requiredRoles: ['super_admin'], allowHigherRoles: false },
  '/system-email': { path: '/system-email', requiredRoles: ['super_admin'], allowHigherRoles: false },
};

export function getRequiredRolesForRoute(path: string): AppRole[] {
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path].requiredRoles;
  }
  for (const [routePath, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    const pattern = routePath.replace(/:[^/]+/g, '[^/]+');
    if (new RegExp(`^${pattern}$`).test(path)) {
      return permission.requiredRoles;
    }
  }
  return [];
}

export async function canAccessRoute(userRole: AppRole | null, routePath: string): Promise<boolean> {
  return canAccessRouteSync(userRole, routePath);
}

export function canAccessRouteSync(userRole: AppRole | null, routePath: string): boolean {
  if (!userRole) return false;

  let routePermission: RoutePermission | undefined = ROUTE_PERMISSIONS[routePath];
  if (!routePermission) {
    for (const [routePathPattern, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      const pattern = routePathPattern.replace(/:[^/]+/g, '[^/]+');
      if (new RegExp(`^${pattern}$`).test(routePath)) {
        routePermission = perm;
        break;
      }
    }
  }

  if (!routePermission) return true;
  if (routePermission.requiredRoles.length === 0) return true;
  if (routePermission.requiredRoles.includes(userRole)) return true;

  if (routePermission.allowHigherRoles) {
    return routePermission.requiredRoles.some(role => hasRoleOrHigher(userRole, role));
  }

  return false;
}

export function getAccessibleRoutes(role: AppRole): string[] {
  return Object.keys(ROUTE_PERMISSIONS).filter(routePath =>
    canAccessRouteSync(role, routePath)
  );
}

export function getRoutePermission(path: string): RoutePermission | undefined {
  if (ROUTE_PERMISSIONS[path]) return ROUTE_PERMISSIONS[path];
  for (const [routePath, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    const pattern = routePath.replace(/:[^/]+/g, '[^/]+');
    if (new RegExp(`^${pattern}$`).test(path)) return permission;
  }
  return undefined;
}
