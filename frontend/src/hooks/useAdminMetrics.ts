import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminMetrics {
  totalAgencies: number;
  activeAgencies: number;
  totalUsers: number;
  revenueByPlan: Record<string, number>;
  agenciesByPlan: { plan: string; count: number }[];
}

export function useAdminMetrics() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await api.get('/admin/metrics');
      return response.data.data as AdminMetrics;
    },
  });

  return {
    metrics,
    isLoading,
    error,
  };
}
