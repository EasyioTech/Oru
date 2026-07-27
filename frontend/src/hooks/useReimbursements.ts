import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ReimbursementRequest {
  id: string;
  employee_id: string;
  amount: number;
  currency: string;
  expense_date: string;
  description: string;
  business_purpose: string;
  status: string;
  submitted_at: string;
  created_at: string;
  expense_categories?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
}

export function useReimbursements() {
  const queryClient = useQueryClient();

  const { data: reimbursements, isLoading, error } = useQuery({
    queryKey: ['reimbursements'],
    queryFn: async () => {
      const response = await api.get('/finance/reimbursements');
      return response.data.data as ReimbursementRequest[];
    },
  });

  const createReimbursement = useMutation({
    mutationFn: async (data: Partial<ReimbursementRequest>) => {
      const response = await api.post('/finance/reimbursements', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
    },
  });

  const updateReimbursement = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReimbursementRequest> }) => {
      const response = await api.put(`/finance/reimbursements/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
    },
  });

  const deleteReimbursement = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/reimbursements/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
    },
  });

  return {
    reimbursements: reimbursements || [],
    isLoading,
    error,
    createReimbursement,
    updateReimbursement,
    deleteReimbursement
  };
}
