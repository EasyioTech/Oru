import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
}

export function usePayments() {
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      // Pointing to the new fastify route, assuming it exists or will be added
      const response = await api.get('/finance/payments');
      return response.data.data as Payment[];
    },
  });

  const createPayment = useMutation({
    mutationFn: async (data: Omit<Payment, 'id'>) => {
      const response = await api.post('/finance/payments', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Payment> }) => {
      const response = await api.put(`/finance/payments/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/payments/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  return {
    payments: payments || [],
    isLoading,
    error,
    createPayment,
    updatePayment,
    deletePayment
  };
}
