export interface Project {
  id?: string;
  name: string;
  description: string | null;
  project_code?: string | null;
  project_type?: string | null;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  start_date: string | null;
  end_date: string | null;
  deadline?: string | null;
  budget: number | null;
  actual_cost?: number | null;
  allocated_budget?: number | null;
  cost_center?: string | null;
  currency?: string;
  client_id: string | null;
  project_manager_id?: string | null;
  account_manager_id?: string | null;
  assigned_team: any;
  departments?: string[];
  tags?: string[];
  categories?: string[];
  progress: number;
}

export interface Client {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
}

export interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  display_name?: string;
  department?: string;
  position?: string;
}

export interface Department {
  id: string;
  name: string;
  manager_name?: string;
  member_count?: number;
}

export interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onProjectSaved: () => void;
}
