import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

export const useClients = (filters?: { status?: string; search?: string }) => {
    return useQuery({
        queryKey: ['clients', filters],
        queryFn: async () => {
            const query = new URLSearchParams(filters as Record<string, string>).toString();
            return fetchJson(`/crm/clients${query ? `?${query}` : ''}`);
        }
    });
};

export const useClient = (id: string) => {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: () => fetchJson(`/crm/clients/${id}`),
        enabled: !!id
    });
};

export const useClientMutations = () => {
    const queryClient = useQueryClient();

    const createClient = useMutation({
        mutationFn: (data: unknown) => fetchMutate('/crm/clients', 'POST', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
    });

    const updateClient = useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => fetchMutate(`/crm/clients/${id}`, 'PUT', data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
        }
    });

    const deleteClient = useMutation({
        mutationFn: (id: string) => fetchMutate(`/crm/clients/${id}`, 'DELETE'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
    });

    return { createClient, updateClient, deleteClient };
};
