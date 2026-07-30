/**
 * Employee permission utilities
 * Helper functions for checking employee access permissions
 */

import { canAccessEmployeeData, canManageRole, type AppRole } from '@/utils/roleUtils';

/**
 * Check if user can view employee
 */
export const canViewEmployee = (
  employee: any,
  user: any,
  userRole: string | undefined,
  managerDepartment?: string
): boolean => {
  if (!user || !userRole) return false;
  // Everyone can see their own record
  if (employee.user_id === user.id) return true;
  return canAccessEmployeeData(userRole as AppRole, managerDepartment, employee.department);
};

/**
 * Check if user can manage employee
 */
export const canManageEmployee = (
  employee: any,
  user: any,
  userRole: string | undefined,
  managerDepartment?: string
): boolean => {
  if (!user || !userRole) return false;
  // Cannot manage yourself from this screen
  if (employee.user_id === user.id) return false;
  const canAccess = canAccessEmployeeData(
    userRole as AppRole,
    managerDepartment,
    employee.department
  );
  if (!canAccess) return false;
  // Treat missing/invalid role as 'employee' (lowest privilege - can be managed by all managers)
  const targetRole = (employee.role && typeof employee.role === 'string') 
    ? (employee.role as AppRole) 
    : 'employee';
  return canManageRole(userRole as AppRole, targetRole);
};

