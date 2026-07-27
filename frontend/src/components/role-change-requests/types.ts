import type { AppRole } from '@/utils/roleUtils';

export interface RoleChangeRequest {
  id: string;
  user_id: string;
  previous_role: AppRole | null;
  requested_role: AppRole;
  reason: string | null;
  requested_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  profile?: { full_name: string; email: string };
  requested_by_profile?: { full_name: string; email: string };
  reviewed_by_profile?: { full_name: string };
}

export interface NewRequestForm {
  user_id: string;
  requested_role: AppRole | '';
  reason: string;
}

export type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'expired';
export type ActionType = 'approve' | 'reject' | 'delete';
