/**
 * Standardized Department Selector Service
 * 
 * This service provides a centralized, reliable way to fetch departments
 * for dropdowns and selectors across the entire application.
 * 
 * Key Features:
 * - Automatic agency_id filtering (multi-tenant isolation)
 * - Handles departments with missing records gracefully
 * - Consistent data structure across all components
 * - Active status filtering
 * - Performance optimized with proper indexing
 */

import { selectRecords, selectOne } from '../core';
import { getAgencyId } from '@/utils/agencyUtils';
import { fetchDepartmentsList } from './departments-api';

/**
 * Department option interface for dropdowns/selectors
 */
export interface DepartmentOption {
  id: string;
  name: string;
  /** Optional; not in schema - use only if departments.code column is added */
  code?: string | null;
  description: string | null;
  manager_id: string | null;
  manager_name: string | null;
  parent_department_id: string | null;
  parent_department_name: string | null;
  member_count: number;
  is_active: boolean;
}

/**
 * Options for fetching departments
 */
export interface DepartmentFetchOptions {
  includeInactive?: boolean;  // Include inactive departments (default: false)
  parentDepartmentId?: string; // Filter by parent department
  search?: string;             // Search by name or description
  limit?: number;              // Limit results (for pagination)
  offset?: number;             // Offset for pagination
}

/**
 * Get all departments for selection dropdowns
 * Automatically filters by agency_id and handles all edge cases
 * 
 * @param agencyId - Agency ID to filter departments (required for multi-tenant isolation)
 * @param options - Optional filtering options
 * @returns Array of department options for dropdowns
 * 
 * @example
 * ```typescript
 * const agencyId = await getAgencyId(profile, user?.id);
 * const departments = await getDepartmentsForSelection(agencyId, {
 *   includeInactive: false,
 *   search: 'Engineering'
 * });
 * ```
 */
export async function getDepartmentsForSelection(
  agencyId: string | null,
  options: DepartmentFetchOptions = {}
): Promise<DepartmentOption[]> {
  if (!agencyId) {
    console.warn('getDepartmentsForSelection: No agencyId provided, returning empty array');
    return [];
  }

  const {
    includeInactive = false,
    parentDepartmentId,
    search,
    limit,
    offset
  } = options;

  try {
    // Use list API in browser for one aggregated query (no N+1)
    if (typeof window !== 'undefined') {
      try {
        const { departments: list } = await fetchDepartmentsList({
          limit: limit ?? 500,
          offset: offset ?? 0,
          sortBy: 'name',
          sortDir: 'asc',
          search: search ?? undefined,
          is_active: includeInactive ? undefined : true,
          parent_department_id: parentDepartmentId ?? undefined,
        });
        return list.map((d) => ({
          id: d.id,
          name: d.name || 'Unnamed Department',
          code: null,
          description: d.description || null,
          manager_id: d.manager_id,
          manager_name: d.manager?.full_name ?? null,
          parent_department_id: d.parent_department_id,
          parent_department_name: d.parent_department?.name ?? null,
          member_count: d._count?.team_assignments ?? 0,
          is_active: d.is_active !== false,
        }));
      } catch (apiErr: unknown) {
        console.error('getDepartmentsForSelection: list API failed', apiErr);
        throw apiErr;
      }
    }

    throw new Error('getDepartmentsForSelection: Only supported in browser environment with fetch API');
  } catch (error: unknown) {
    console.error('Error in getDepartmentsForSelection:', error);
    throw new Error(`Failed to fetch departments: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a single department by ID with full details
 * 
 * @param departmentId - Department ID
 * @param options - Optional options
 * @returns Department option or null if not found
 */
export async function getDepartmentById(
  departmentId: string,
  options: DepartmentFetchOptions = {}
): Promise<DepartmentOption | null> {
  try {
    const { departments } = await fetchDepartmentsList({ limit: 1000 });
    const dept = departments.find((d) => d.id === departmentId);
    
    if (!dept) return null;

    return {
      id: dept.id,
      name: dept.name || 'Unnamed Department',
      code: null,
      description: dept.description || null,
      manager_id: dept.manager_id || null,
      manager_name: dept.manager?.full_name || null,
      parent_department_id: dept.parent_department_id || null,
      parent_department_name: dept.parent_department?.name || null,
      member_count: dept._count?.team_assignments || 0,
      is_active: dept.is_active !== false
    };
  } catch (error: unknown) {
    console.error('Error in getDepartmentById:', error);
    throw new Error(`Failed to fetch department: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get departments for selection (convenience wrapper)
 * Automatically gets agencyId from profile and user
 * 
 * @param profile - User profile from useAuth hook
 * @param userId - User ID
 * @param options - Optional filtering options
 * @returns Array of department options
 * 
 * @example
 * ```typescript
 * const { profile, user } = useAuth();
 * const departments = await getDepartmentsForSelectionAuto(profile, user?.id, {
 *   includeInactive: false
 * });
 * ```
 */
export async function getDepartmentsForSelectionAuto(
  profile: { agency_id?: string | null } | null | undefined,
  userId: string | null | undefined,
  options: DepartmentFetchOptions = {}
): Promise<DepartmentOption[]> {
  const agencyId = await getAgencyId(profile, userId);
  // Note: In isolated database architecture, agencyId might not be needed for departments
  // But we'll keep the signature consistent with other selector services
  return await getDepartmentsForSelection(agencyId, options);
}

