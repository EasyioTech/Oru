import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Receipt {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  description: string;
  receiptUrl: string | null;
  request_id?: string;
  category_id?: string;
  business_purpose?: string;
  employee_id?: string;
}

export function useReceipts() {
  const queryClient = useQueryClient();

  const { data: receipts, isLoading, error } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const response = await api.get('/finance/receipts');
      return response.data.data as Receipt[];
    },
  });

  const createReceipt = useMutation({
    mutationFn: async (data: Omit<Receipt, 'id'>) => {
      const response = await api.post('/finance/receipts', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  const updateReceipt = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Receipt> }) => {
      const response = await api.put(`/finance/receipts/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  const deleteReceipt = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/receipts/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  return {
    receipts: receipts || [],
    isLoading,
    error,
    createReceipt,
    updateReceipt,
    deleteReceipt
  };
}
