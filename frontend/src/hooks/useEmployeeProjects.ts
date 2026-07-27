import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AssignedProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  budget: number;
  startDate: string | null;
  endDate: string | null;
}

export function useEmployeeProjects() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employee-projects'],
    queryFn: async () => {
      const response = await api.get('/projects'); // Adjust endpoint as needed
      return (response.data.data || []) as AssignedProject[];
    },
  });

  return {
    projects: data || [],
    isLoading,
    error,
  };
}
