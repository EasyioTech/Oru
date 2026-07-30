import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuditLog {
  id: string;
  agencyId: string;
  userId: string;
  action: string;
  resourceType: string;
  details: any;
  createdAt: string;
}

export function useAdminAuditLogs(params?: Record<string, any>) {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: async () => {
      const response = await api.get(`/admin/audit-logs${params ? '?' + new URLSearchParams(params as any).toString() : ''}`);
      return (response.data.data || []) as AuditLog[];
    },
  });

  return {
    logs: logs || [],
    isLoading,
    error,
  };
}
