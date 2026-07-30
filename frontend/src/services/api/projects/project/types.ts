export interface Project {
  id: string;
  name: string;
  description: string | null;
  project_code: string | null;
  project_type: string | null;
  status: 'planning' | 'active' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string | null;
  end_date: string | null;
  deadline: string | null;
  budget: number | null;
  actual_cost: number | null;
  allocated_budget: number | null;
  cost_center: string | null;
  currency: string;
  client_id: string | null;
  project_manager_id: string | null;
  account_manager_id: string | null;
  assigned_team: string[];
  departments: string[];
  tags: string[];
  categories: string[];
  custom_fields: Record<string, any>;
  progress: number;
  agency_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    id: string;
    name: string;
    company_name: string | null;
    email?: string | null;
    phone?: string | null;
    contact_person?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    address?: string | null;
    payment_terms?: string | null;
    industry?: string | null;
    status?: string | null;
  };
  project_manager?: {
    id: string;
    full_name: string;
  };
  account_manager?: {
    id: string;
    full_name: string;
  };
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  task_type: string | null;
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  due_date: string | null;
  start_date: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  progress: number;
  assignee_id: string | null;
  created_by: string | null;
  completed_at: string | null;
  tags: string[];
  attachments: any[];
  checklist: any[];
  dependencies: string[];
  custom_fields: Record<string, any>;
  agency_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    full_name: string;
  };
  assignments?: Array<{
    id: string;
    user_id: string;
    user: {
      id: string;
      full_name: string;
    };
  }>;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  assigned_by: string | null;
  agency_id: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  parent_comment_id: string | null;
  attachments: any[];
  mentions: string[];
  agency_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface TimeTracking {
  id: string;
  task_id: string;
  user_id: string;
  date: string;
  hours_logged: number;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  description: string | null;
  billable: boolean;
  hourly_rate: number | null;
  agency_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
  };
}

export interface ProjectFilters {
  status?: string[];
  client_id?: string;
  project_manager_id?: string;
  priority?: string[];
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  budget_range?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface TaskFilters {
  project_id?: string;
  assignee_id?: string;
  status?: string[];
  priority?: string[];
  due_date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
  search?: string;
}