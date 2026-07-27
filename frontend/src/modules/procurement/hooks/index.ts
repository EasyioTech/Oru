import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Purchase Requisitions ────────────────────────────────────────────────────

export const usePurchaseRequisitions = (filters?: { status?: string; departmentId?: string }) =>
  useQuery({
    queryKey: ['procurement_requisitions', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/procurement/requisitions${query ? `?${query}` : ''}`);
    },
  });

export const usePurchaseRequisition = (id: string) =>
  useQuery({
    queryKey: ['procurement_requisitions', id],
    queryFn: () => fetchJson(`/procurement/requisitions/${id}`),
    enabled: !!id,
  });

export const useCreatePurchaseRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/procurement/requisitions', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement_requisitions'] }),
  });
};

export const useApprovePurchaseRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/procurement/requisitions/${id}/approve`, 'POST'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement_requisitions'] }),
  });
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const usePurchaseOrders = (filters?: { status?: string; supplierId?: string; dateFrom?: string; dateTo?: string }) =>
  useQuery({
    queryKey: ['procurement_orders', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/procurement/orders${query ? `?${query}` : ''}`);
    },
  });

export const usePurchaseOrder = (id: string) =>
  useQuery({
    queryKey: ['procurement_orders', id],
    queryFn: () => fetchJson(`/procurement/orders/${id}`),
    enabled: !!id,
  });

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/procurement/orders', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement_orders'] }),
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/procurement/orders/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['procurement_orders'] });
      queryClient.invalidateQueries({ queryKey: ['procurement_orders', id] });
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/procurement/orders/${id}/approve`, 'POST'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement_orders'] }),
  });
};

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const useSuppliers = (filters?: { status?: string; search?: string }) =>
  useQuery({
    queryKey: ['procurement_suppliers', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/procurement/suppliers${query ? `?${query}` : ''}`);
    },
  });

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/procurement/suppliers', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement_suppliers'] }),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/procurement/suppliers/${id}`, 'PUT', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement_suppliers'] }),
  });
};

// ─── Procurement Metrics ──────────────────────────────────────────────────────

export const useProcurementMetrics = () =>
  useQuery({
    queryKey: ['procurement_metrics'],
    queryFn: () => fetchJson('/procurement/metrics'),
  });
