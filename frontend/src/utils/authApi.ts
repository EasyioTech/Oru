import { getApiBaseUrl } from '@/config/api';

const token = () => localStorage.getItem('auth_token') ?? '';

export const fetchJson = async (path: string, options?: RequestInit) => {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}/api${path.startsWith('/') ? '' : '/'}${path}`;
  
  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Bearer ${token()}`);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
  }
  
  const responseData = await res.json();
  // Ensure we return the data payload if wrapped in standard Fastify envelope
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData.data;
  }
  return responseData;
};

export const fetchMutate = async (path: string, method: 'POST' | 'PUT' | 'DELETE' | 'PATCH', body?: unknown) => {
    return fetchJson(path, {
        method,
        body: body ? JSON.stringify(body) : undefined
    });
};
