import { getApiBaseUrl } from '@/config/api';

export const API_BASE = getApiBaseUrl();

export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function requireAuth(): string {
  const token = getStorageItem('auth_token');
  if (!token) throw new Error('Authentication required');
  return token;
}

export function agencyDatabase(): string {
  return getStorageItem('agency_database') || '';
}
