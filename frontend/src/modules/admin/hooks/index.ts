import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Agencies ─────────────────────────────────────────────────────────────────

export const useAgencies = (filters?: { status?: string; plan?: string; search?: string }) =>
  useQuery({
    queryKey: ['admin_agencies', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/admin/agencies${query ? `?${query}` : ''}`);
    },
  });

export const useAgency = (id: string) =>
  useQuery({
    queryKey: ['admin_agencies', id],
    queryFn: () => fetchJson(`/admin/agencies/${id}`),
    enabled: !!id,
  });

export const useCreateAgency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/admin/agencies', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_agencies'] }),
  });
};

export const useSuspendAgency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      fetchMutate(`/admin/agencies/${id}/suspend`, 'POST', { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_agencies'] }),
  });
};

// ─── Plans / Features ─────────────────────────────────────────────────────────

export const usePlans = () =>
  useQuery({
    queryKey: ['admin_plans'],
    queryFn: () => fetchJson('/admin/plans'),
    staleTime: 1000 * 60 * 30, // plans rarely change — 30min cache
  });

export const useUpdateAgencyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agencyId, planId }: { agencyId: string; planId: string }) =>
      fetchMutate(`/admin/agencies/${agencyId}/plan`, 'PUT', { planId }),
    onSuccess: (_, { agencyId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin_agencies', agencyId] });
    },
  });
};

// ─── Platform Metrics ─────────────────────────────────────────────────────────

export const usePlatformMetrics = () =>
  useQuery({
    queryKey: ['admin_metrics'],
    queryFn: () => fetchJson('/admin/metrics'),
  });

export const usePlatformHealth = () =>
  useQuery({
    queryKey: ['admin_health'],
    queryFn: () => fetchJson('/admin/health'),
    refetchInterval: 30_000, // health check every 30s
  });
