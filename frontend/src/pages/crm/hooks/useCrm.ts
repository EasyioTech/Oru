import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// Leads
export const useLeads = (filters?: { status?: string; priority?: string; search?: string }) => {
    return useQuery({
        queryKey: ['crm_leads', filters],
        queryFn: async () => {
            const query = new URLSearchParams(filters as Record<string, string>).toString();
            return fetchJson(`/crm/leads${query ? `?${query}` : ''}`);
        }
    });
};

export const useLead = (id: string) => {
    return useQuery({
        queryKey: ['crm_leads', id],
        queryFn: () => fetchJson(`/crm/leads/${id}`),
        enabled: !!id
    });
};

export const useLeadMutations = () => {
    const queryClient = useQueryClient();

    const createLead = useMutation({
        mutationFn: (data: unknown) => fetchMutate('/crm/leads', 'POST', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_leads'] })
    });

    const updateLead = useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => fetchMutate(`/crm/leads/${id}`, 'PUT', data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['crm_leads'] });
            queryClient.invalidateQueries({ queryKey: ['crm_leads', variables.id] });
        }
    });

    const deleteLead = useMutation({
        mutationFn: (id: string) => fetchMutate(`/crm/leads/${id}`, 'DELETE'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_leads'] })
    });

    const convertLead = useMutation({
        mutationFn: (id: string) => fetchMutate(`/crm/leads/${id}/convert`, 'POST'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_leads'] })
    });

    return { createLead, updateLead, deleteLead, convertLead };
};

// Activities
export const useActivities = (filters?: { leadId?: string; clientId?: string }) => {
    return useQuery({
        queryKey: ['crm_activities', filters],
        queryFn: async () => {
            const query = new URLSearchParams(filters as Record<string, string>).toString();
            return fetchJson(`/crm/activities${query ? `?${query}` : ''}`);
        }
    });
};

export const useActivityMutations = () => {
    const queryClient = useQueryClient();

    const createActivity = useMutation({
        mutationFn: (data: unknown) => fetchMutate('/crm/activities', 'POST', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_activities'] })
    });

    const updateActivity = useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => fetchMutate(`/crm/activities/${id}`, 'PUT', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_activities'] })
    });

    const deleteActivity = useMutation({
        mutationFn: (id: string) => fetchMutate(`/crm/activities/${id}`, 'DELETE'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm_activities'] })
    });

    return { createActivity, updateActivity, deleteActivity };
};

// Metrics
export const useCrmMetrics = () => {
    return useQuery({
        queryKey: ['crm_metrics'],
        queryFn: () => fetchJson('/crm/metrics')
    });
};
