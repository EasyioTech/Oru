import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ReportExport {
  id: string;
  name: string;
  report_type: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  file_path?: string;
  file_name?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generated_by?: string;
  generated_at: string;
  expires_at?: string;
  download_count: number;
  parameters?: Record<string, unknown>;
}

export function useReportExports(filters: { status?: string, format?: string, search?: string, date_from?: string, date_to?: string } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['report-exports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.format && filters.format !== 'all') params.append('format', filters.format);
      if (filters.search) params.append('search', filters.search);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/reports/exports?${params.toString()}`);
      return (response.data.data || []) as ReportExport[];
    },
  });

  const deleteExport = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/reports/exports/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-exports'] });
    },
  });

  return {
    exports: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    deleteExport,
    refetch: query.refetch
  };
}
