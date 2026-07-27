import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'inventory' | 'procurement' | 'assets' | 'financial' | 'custom';
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_config: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export function useScheduledReports(filters: { search?: string } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['scheduled-reports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/reports/scheduled?${params.toString()}`);
      return (response.data.data || []) as ScheduledReport[];
    },
  });

  const createReport = useMutation({
    mutationFn: async (data: Partial<ScheduledReport>) => {
      const response = await api.post('/reports/scheduled', data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] }),
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ScheduledReport> }) => {
      const response = await api.put(`/reports/scheduled/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] }),
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/reports/scheduled/${id}`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const response = await api.put(`/reports/scheduled/${id}`, { is_active });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] }),
  });

  return {
    reports: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createReport,
    updateReport,
    deleteReport,
    toggleActive
  };
}
