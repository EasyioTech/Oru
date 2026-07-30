import { useQuery } from '@tanstack/react-query';
import { dashboardStore, HealthAlert } from '../stores/dashboardStore';

export interface HealthStatus {
  api: 'healthy' | 'degraded' | 'down';
  db: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
}

export interface ActionItem {
  title: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
}

export function useHealthAlerts() {
  const setHealthAlerts = dashboardStore((state) => state.setHealthAlerts);

  const { data, isLoading, error } = useQuery({
    queryKey: ['agencyHealth'],
    queryFn: async () => {
      const response = await fetch('/api/agency/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30s
    staleTime: 25000,
  });

  // Sync alerts to store
  if (data?.alerts) {
    setHealthAlerts(data.alerts);
  }

  return {
    healthScore: data?.score ?? 0,
    status: data?.status ?? { api: 'down', db: 'down', redis: 'down' },
    alerts: data?.alerts ?? [],
    actionItems: data?.actionItems ?? [],
    isLoading,
    error,
  };
}
