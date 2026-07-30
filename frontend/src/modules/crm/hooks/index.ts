import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Clients ────────────────────────────────────────────────────────────────

export const useClients = (filters?: { status?: string; search?: string }) =>
  useQuery({
    queryKey: ['crm_clients', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/crm/clients${query ? `?${query}` : ''}`);
    },
  });

export const useClient = (id: string) =>
  useQuery({
    queryKey: ['crm_clients', id],
    queryFn: () => fetchJson(`/crm/clients/${id}`),
    enabled: !!id,
  });

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchMutate('/crm/clients', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_clients'] }),
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchMutate(`/crm/clients/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['crm_clients'] });
      queryClient.invalidateQueries({ queryKey: ['crm_clients', id] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/crm/clients/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_clients'] }),
  });
};

// ─── Leads ──────────────────────────────────────────────────────────────────

export const useLeads = (filters?: { status?: string; priority?: string; search?: string }) =>
  useQuery({
    queryKey: ['crm_leads', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/crm/leads${query ? `?${query}` : ''}`);
    },
  });

export const useLead = (id: string) =>
  useQuery({
    queryKey: ['crm_leads', id],
    queryFn: () => fetchJson(`/crm/leads/${id}`),
    enabled: !!id,
  });

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchMutate('/crm/leads', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_leads'] }),
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchMutate(`/crm/leads/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['crm_leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm_leads', id] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/crm/leads/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_leads'] }),
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/crm/leads/${id}/convert`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm_clients'] });
    },
  });
};

// ─── Activities ──────────────────────────────────────────────────────────────

export const useActivities = (filters?: { leadId?: string; clientId?: string }) =>
  useQuery({
    queryKey: ['crm_activities', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/crm/activities${query ? `?${query}` : ''}`);
    },
  });

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchMutate('/crm/activities', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_activities'] }),
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchMutate(`/crm/activities/${id}`, 'PUT', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_activities'] }),
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/crm/activities/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_activities'] }),
  });
};

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const useCrmMetrics = () =>
  useQuery({
    queryKey: ['crm_metrics'],
    queryFn: () => fetchJson('/crm/metrics'),
  });
