/**
 * Password Change Service
 * Calls the appropriate backend endpoint based on user context:
 * - Agency users: POST /api/password-policy/change (policy enforcement)
 * - Super admins: POST /api/auth/change-password (main DB)
 */

import { getApiRoot } from '@/config/api';

function getAuthToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

function getAgencyDatabase(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('agency_database') : null;
}

export interface ChangePasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Change user password.
 * Uses /api/password-policy/change for agency users (with policy enforcement).
 * Uses /api/auth/change-password for super admins (no agency context).
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const baseUrl = getApiRoot().replace(/\/$/, '');
  const agencyDatabase = getAgencyDatabase();

  // Agency users: use password-policy endpoint (has policy enforcement)
  const url = agencyDatabase
    ? `${baseUrl}/password-policy/change`
    : `${baseUrl}/auth/change-password`;

  const body = agencyDatabase
    ? { currentPassword, newPassword }
    : { currentPassword, newPassword };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (agencyDatabase) {
    headers['X-Agency-Database'] = agencyDatabase;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errors = data.errors;
    const message = Array.isArray(errors) && errors.length > 0
      ? errors.join('. ')
      : data.message || data.error || 'Failed to change password';
    throw new Error(message);
  }

  return {
    success: true,
    message: data.message || 'Password changed successfully',
  };
}
