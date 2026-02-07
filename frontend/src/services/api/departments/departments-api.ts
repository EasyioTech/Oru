/**
 * Department list API – server-side pagination and filters (no N+1).
 */

import { getApiRoot } from '@/config/api';

export interface DepartmentsListParams {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'budget' | 'created_at' | 'employees';
  sortDir?: 'asc' | 'desc';
  search?: string;
  is_active?: boolean;
  manager_id?: string;
  parent_department_id?: string;
  min_budget?: number | string;
  max_budget?: number | string;
}

export interface DepartmentListRow {
  id: string;
  name: string;
  description?: string | null;
  manager_id?: string | null;
  parent_department_id?: string | null;
  budget?: number;
  is_active: boolean;
  agency_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  manager?: { full_name: string } | null;
  parent_department?: { name: string } | null;
  _count?: { team_assignments: number };
}

export interface DepartmentsListResponse {
  success: boolean;
  data?: { departments: DepartmentListRow[]; total: number };
  meta?: { total?: number };
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('auth_token') || '';
    const agencyDatabase = window.localStorage.getItem('agency_database') || '';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (agencyDatabase) headers['X-Agency-Database'] = agencyDatabase;
  }
  return headers;
}

/**
 * Fetch departments list with server-side pagination and filters.
 */
export async function fetchDepartmentsList(params: DepartmentsListParams): Promise<{ departments: DepartmentListRow[]; total: number }> {
  const base = getApiRoot().replace(/\/$/, '');
  const search = new URLSearchParams();
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.offset != null) search.set('offset', String(params.offset));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  if (params.search != null && params.search !== '') search.set('search', params.search);
  if (params.is_active !== undefined && params.is_active !== null) search.set('is_active', String(params.is_active));
  if (params.manager_id) search.set('manager_id', params.manager_id);
  if (params.parent_department_id) search.set('parent_department_id', params.parent_department_id);
  if (params.min_budget != null && params.min_budget !== '') search.set('min_budget', String(params.min_budget));
  if (params.max_budget != null && params.max_budget !== '') search.set('max_budget', String(params.max_budget));
  const url = `${base}/departments?${search.toString()}`;
  const res = await fetch(url, { method: 'GET', headers: await authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text);
      msg = typeof j?.error === 'string' ? j.error : (j?.error?.message ?? j?.message ?? text);
    } catch {
      // use text
    }
    throw new Error(msg || `Departments list failed: ${res.status}`);
  }
  const json = (await res.json()) as DepartmentsListResponse;
  const data = json.data ?? (json as any);
  const departments = data.departments ?? [];
  const total = data.total ?? json.meta?.total ?? departments.length;
  return { departments, total };
}

export interface DepartmentStats {
  active: number;
  inactive: number;
  totalBudget: number;
  totalEmployees: number;
}

/**
 * Fetch department stats (active/inactive counts, total budget, total employees).
 */
export async function fetchDepartmentsStats(): Promise<DepartmentStats> {
  const base = getApiRoot().replace(/\/$/, '');
  const url = `${base}/departments/stats`;
  const res = await fetch(url, { method: 'GET', headers: await authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Departments stats failed: ${res.status}`);
  }
  const json = await res.json();
  const data = json.data ?? json;
  return {
    active: data.active ?? 0,
    inactive: data.inactive ?? 0,
    totalBudget: Number(data.totalBudget ?? 0),
    totalEmployees: Number(data.totalEmployees ?? 0),
  };
}

function parseErrorResponse(res: Response, text: string): string {
  try {
    const j = JSON.parse(text);
    return (j?.error?.message ?? j?.message ?? text) || `Request failed: ${res.status}`;
  } catch {
    return text || `Request failed: ${res.status}`;
  }
}

export interface DepartmentCreatePayload {
  name: string;
  description?: string | null;
  manager_id?: string | null;
  parent_department_id?: string | null;
  budget?: number;
  agency_id?: string | null;
}

export interface DepartmentUpdatePayload {
  name?: string;
  description?: string | null;
  manager_id?: string | null;
  parent_department_id?: string | null;
  budget?: number;
  is_active?: boolean;
}

/**
 * Create a department via REST API (backend validation applies).
 */
export async function createDepartment(payload: DepartmentCreatePayload): Promise<DepartmentListRow> {
  const base = getApiRoot().replace(/\/$/, '');
  const res = await fetch(`${base}/departments`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorResponse(res, text));
  }
  const json = await res.json();
  const data = json.data ?? json;
  return data;
}

/**
 * Update a department via REST API (backend validation applies). Use for restore (is_active: true) as well.
 */
export async function updateDepartment(id: string, payload: DepartmentUpdatePayload): Promise<DepartmentListRow> {
  const base = getApiRoot().replace(/\/$/, '');
  const res = await fetch(`${base}/departments/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorResponse(res, text));
  }
  const json = await res.json();
  const data = json.data ?? json;
  return data;
}

/**
 * Soft delete (archive) or hard delete a department.
 * @param id - department id
 * @param hard - if true, permanently delete; otherwise set is_active = false
 */
export async function deleteDepartment(id: string, hard = false): Promise<void> {
  const base = getApiRoot().replace(/\/$/, '');
  const url = hard ? `${base}/departments/${id}?hard=true` : `${base}/departments/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers: await authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseErrorResponse(res, text));
  }
}
