import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Employee {
  id: string;
  employee_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  position?: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  hire_date?: string;
}

export function useEmployees() {
  const queryClient = useQueryClient();

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get('/hr/employees');
      return response.data.data as Employee[];
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/hr/employees/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees: employees || [],
    isLoading,
    error,
    deleteEmployee
  };
}
