/**
 * Shared types for Department Management
 */

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  parent_department_id?: string;
  budget?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  manager?: {
    full_name: string;
  } | null;
  parent_department?: {
    name: string;
  } | null;
  _count?: {
    team_assignments: number;
  };
}

export type ViewMode = "cards" | "table" | "list";
export type SortField = "name" | "budget" | "employees" | "created_at";
export type SortDirection = "asc" | "desc";

export interface DepartmentStats {
  active: number;
  inactive: number;
  total: number;
  totalBudget: number;
  totalEmployees: number;
  avgBudget: number;
  avgEmployees: number;
  departmentsWithManager: number;
  departmentsWithParent: number;
}
