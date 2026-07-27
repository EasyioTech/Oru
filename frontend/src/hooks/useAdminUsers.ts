import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  agencyId: string;
  status: string;
  createdAt: string;
}

export function useAdminUsers() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return (response.data.data || []) as AdminUser[];
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
  };
}
