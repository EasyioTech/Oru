// Shared platform types — used by both backend and frontend

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee' | 'viewer';

export type AgencyPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// Re-export module types as they are created
export type * from './auth.js';
