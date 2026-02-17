
import { getApiEndpoint } from '@/config/services';

interface SystemHealth {
    status: string;
    uptime: number;
    timestamp: string;
    system: {
        loadAverage: number[];
        memory: {
            total: number;
            free: number;
            used: number;
            process?: {
                rss: number;
                heapTotal: number;
                heapUsed: number;
                external: number;
            };
        };
        disk?: {
            total: number;
            free: number;
            used: number;
            path: string;
        };
        cpuCount: number;
        platform: string;
        nodeVersion: string;
    };
    services: {
        database: {
            status: string;
            latency: number;
        };
        redis: {
            status: string;
            latency: number;
        };
        storage?: {
            status: string;
            latency: number;
            provider?: string;
        };
    };
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
    const token = localStorage.getItem('auth_token');
    const endpoint = getApiEndpoint('/monitoring/live-health');

    const response = await fetch(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch system health');
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Unknown error');
    }

    return data.data;
}
