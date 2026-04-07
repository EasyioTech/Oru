import { getApiBaseUrl } from '@/config/api';

/**
 * A simple, thin wrapper around fetch to provide an axios-like interface
 * for the public components.
 */
export const api = {
  get: async (endpoint: string) => {
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  },
  
  post: async (endpoint: string, body: any) => {
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  }
};
