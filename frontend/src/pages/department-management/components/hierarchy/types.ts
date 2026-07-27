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
  manager?: { full_name: string } | null;
  parent_department?: { name: string } | null;
  _count?: { team_assignments: number };
}

export type DepartmentMember = {
  id: string;
  full_name: string;
  position_title?: string;
  role_in_department: string;
};

export interface DepartmentHierarchyViewProps {
  departments: Department[];
  expandedDepartments: Set<string>;
  setExpandedDepartments: (set: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  departmentMembers: Record<string, DepartmentMember[]>;
  setDepartmentMembers: (members: any) => void;
  onDepartmentClick: (dept: Department) => void;
  db: any;
  onRefresh?: () => void;
}
