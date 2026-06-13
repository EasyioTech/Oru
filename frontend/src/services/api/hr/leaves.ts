import { getApiEndpoint } from '@/config/services';

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  max_days_per_year?: number;
  is_paid: boolean;
  is_active: boolean;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  leave_type?: LeaveType;
  employee?: {
    full_name: string;
    avatar_url?: string;
  };
}

const authHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const endpoint = getApiEndpoint('/hr/leaves/types');
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch leave types');
  }

  const { data } = await response.json();
  return data;
}

export async function fetchLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
  let endpoint = getApiEndpoint('/hr/leaves/requests');
  if (employeeId) {
    endpoint += `?employeeId=${employeeId}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch leave requests');
  }

  const { data } = await response.json();
  return data;
}

export async function createLeaveRequest(requestData: Partial<LeaveRequest>): Promise<LeaveRequest> {
  const endpoint = getApiEndpoint('/hr/leaves/requests');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create leave request');
  }

  const { data } = await response.json();
  return data;
}

export async function updateLeaveRequest(id: string, requestData: Partial<LeaveRequest>): Promise<LeaveRequest> {
  const endpoint = getApiEndpoint(`/hr/leaves/requests/${id}`);
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update leave request');
  }

  const { data } = await response.json();
  return data;
}
