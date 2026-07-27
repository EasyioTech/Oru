import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  [key: string]: any;
}

export function useDepartments() {
  const qc = useQueryClient();
  
  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchJson('/hr/departments') as Promise<Department[]>
  });

  const { data: stats } = useQuery({
    queryKey: ['departments-stats'],
    queryFn: () => fetchJson('/hr/departments/stats')
  });

  const createDept = useMutation({
    mutationFn: (data: Partial<Department>) => fetchMutate('/hr/departments', 'POST', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] })
  });

  const updateDept = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Department> }) => fetchMutate(`/hr/departments/${id}`, 'PUT', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] })
  });

  const deleteDept = useMutation({
    mutationFn: (id: string) => fetchMutate(`/hr/departments/${id}`, 'DELETE'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] })
  });

  return { 
    departments: departments || [], 
    stats, 
    isLoading, 
    createDept, 
    updateDept, 
    deleteDept 
  };
}
