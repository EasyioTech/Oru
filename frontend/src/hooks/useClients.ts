import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Client {
  id: string;
  clientNumber: string;
  name: string;
  companyName?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  contactPerson?: string;
  contactPosition?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'suspended';
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  taxId?: string;
  paymentTerms?: number;
  notes?: string;
}

export function useClients() {
  const queryClient = useQueryClient();

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get('/crm/clients');
      return response.data.data as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (data: Omit<Client, 'id' | 'clientNumber'>) => {
      const response = await api.post('/crm/clients', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const response = await api.put(`/crm/clients/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/crm/clients/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients: clients || [],
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient
  };
}
