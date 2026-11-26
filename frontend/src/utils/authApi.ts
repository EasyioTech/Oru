import { getApiBaseUrl } from '@/config/api';

const token = () => (typeof window !== 'undefined' ? localStorage.getItem('auth_token') ?? '' : '');
const agencyId = () => (typeof window !== 'undefined' ? localStorage.getItem('agency_id') ?? '' : '');
const agencyDb = () => (typeof window !== 'undefined' ? localStorage.getItem('agency_database') ?? '' : '');

export const fetchJson = async (path: string, options?: RequestInit) => {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}/api${path.startsWith('/') ? '' : '/'}${path}`;
  
  const headers = new Headers(options?.headers);
  const authToken = token();
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  const aid = agencyId();
  if (aid && !headers.has('X-Agency-Id')) {
    headers.set('X-Agency-Id', aid);
  }
  const adb = agencyDb();
  if (adb && !headers.has('X-Agency-Database')) {
    headers.set('X-Agency-Database', adb);
  }
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.message) {
        errorMessage = errJson.message;
      } else if (errJson?.error && typeof errJson.error === 'string') {
        errorMessage = errJson.error;
      }
    } catch {}
    throw new Error(errorMessage);
  }
  
  const responseData = await res.json();
  // Ensure we return the data payload if wrapped in standard Fastify envelope
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData.data;
  }
  return responseData;
};

export const fetchMutate = async (path: string, method: 'POST' | 'PUT' | 'DELETE' | 'PATCH', body?: any) => {
    return fetchJson(path, {
        method,
        body: body ? JSON.stringify(body) : undefined
    });
};
