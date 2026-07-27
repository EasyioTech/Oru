import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminAgency {
  id: string;
  name: string;
  plan: string;
  status: 'active' | 'suspended' | 'inactive';
  userCount: number;
  createdAt: string;
}

export function useAdminAgencies() {
  const queryClient = useQueryClient();

  const { data: agencies, isLoading, error } = useQuery({
    queryKey: ['admin-agencies'],
    queryFn: async () => {
      const response = await api.get('/admin/agencies');
      return (response.data.data || []) as AdminAgency[];
    },
  });

  const updateAgencyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdminAgency['status'] }) => {
      const response = await api.patch(`/admin/agencies/${id}`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
    },
  });

  return {
    agencies: agencies || [],
    isLoading,
    error,
    updateAgencyStatus,
  };
}
