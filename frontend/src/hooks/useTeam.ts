import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TeamMember {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  hireDate: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  role: string;
}

export function useTeam() {
  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await api.get('/hr/employees');
      return (response.data.data || []) as TeamMember[];
    },
  });

  return {
    teamMembers: teamMembers || [],
    isLoading,
    error,
  };
}
