export type AppRole = 'super_admin' | 'agency_admin' | 'manager' | 'employee' | 'auditor' | 'viewer' | 'custom';

export interface RoleMetadata {
  role: AppRole;
  displayName: string;
  description: string;
  permissions: string[];
  departmentRestricted: boolean;
  level: number;
}

// Role hierarchy levels (lower number = higher authority)
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 1,
  agency_admin: 2,
  manager: 3,
  employee: 4,
  auditor: 5,
  viewer: 6,
  custom: 7,
};

export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  agency_admin: 'Agency Admin',
  manager: 'Manager',
  employee: 'Employee',
  auditor: 'Auditor',
  viewer: 'Viewer',
  custom: 'Custom',
};

export const ROLE_CATEGORIES = {
  system: ['super_admin'] as AppRole[],
  management: ['agency_admin', 'manager'] as AppRole[],
  general: ['employee', 'auditor', 'viewer', 'custom'] as AppRole[],
};

export function hasHigherRole(userRole: AppRole, comparedRole: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[comparedRole];
}

export function hasRoleOrHigher(userRole: AppRole, minimumRole: AppRole): boolean {
  return ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[minimumRole];
}

export function getRoleDisplayName(role: AppRole): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}

export function getRoleCategory(role: AppRole): string {
  for (const [category, roles] of Object.entries(ROLE_CATEGORIES)) {
    if (roles.includes(role)) {
      return category;
    }
  }
  return 'unknown';
}

export function canManageRole(managerRole: AppRole, targetRole: AppRole): boolean {
  if (managerRole === 'super_admin') return true;
  if (managerRole === 'agency_admin') return targetRole !== 'super_admin';
  if (managerRole === 'manager') return ROLE_CATEGORIES.general.includes(targetRole);
  return false;
}

export function getAssignableRoles(userRole: AppRole): AppRole[] {
  const allRoles = Object.keys(ROLE_HIERARCHY) as AppRole[];
  return allRoles.filter(role => canManageRole(userRole, role));
}

export function hasFinancialAccess(userRole: AppRole): boolean {
  return ['super_admin', 'agency_admin', 'manager'].includes(userRole);
}

export function canAccessEmployeeData(userRole: AppRole, userDepartment?: string, targetDepartment?: string): boolean {
  if (['super_admin', 'agency_admin'].includes(userRole)) return true;
  if (userRole === 'manager') return true;
  return false;
}

export function canManageUserRoles(userRole: AppRole): boolean {
  return ['super_admin', 'agency_admin'].includes(userRole);
}
