import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Report Definitions ───────────────────────────────────────────────────────

export const useReportDefinitions = (filters?: { module?: string; type?: string }) =>
  useQuery({
    queryKey: ['reports_definitions', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/reports/definitions${query ? `?${query}` : ''}`);
    },
  });

export const useReportDefinition = (id: string) =>
  useQuery({
    queryKey: ['reports_definitions', id],
    queryFn: () => fetchJson(`/reports/definitions/${id}`),
    enabled: !!id,
  });

export const useCreateReportDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchMutate('/reports/definitions', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports_definitions'] }),
  });
};

export const useUpdateReportDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchMutate(`/reports/definitions/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reports_definitions'] });
      queryClient.invalidateQueries({ queryKey: ['reports_definitions', id] });
    },
  });
};

export const useDeleteReportDefinition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/reports/definitions/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports_definitions'] }),
  });
};

// ─── Report Runs ──────────────────────────────────────────────────────────────

export const useReportRuns = (filters?: { definitionId?: string; status?: string }) =>
  useQuery({
    queryKey: ['reports_runs', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/reports/runs${query ? `?${query}` : ''}`);
    },
  });

export const useReportRun = (id: string) =>
  useQuery({
    queryKey: ['reports_runs', id],
    queryFn: () => fetchJson(`/reports/runs/${id}`),
    enabled: !!id,
    // Poll while report is generating — backend sets status to 'completed'/'failed'
    refetchInterval: (query) => {
      const data = query.state.data as { status?: string } | undefined;
      return data?.status === 'pending' || data?.status === 'running' ? 3000 : false;
    },
  });

export const useRunReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (definitionId: string) =>
      fetchMutate(`/reports/definitions/${definitionId}/run`, 'POST'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports_runs'] }),
  });
};

export const useExportReport = () =>
  useMutation({
    mutationFn: ({ runId, format }: { runId: string; format: 'pdf' | 'xlsx' | 'csv' }) =>
      fetchMutate(`/reports/runs/${runId}/export`, 'POST', { format }),
  });
