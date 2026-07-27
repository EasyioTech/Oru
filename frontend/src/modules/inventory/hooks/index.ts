import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const useWarehouses = () =>
  useQuery({
    queryKey: ['inventory_warehouses'],
    queryFn: () => fetchJson('/inventory/warehouses'),
  });

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/inventory/warehouses', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory_warehouses'] }),
  });
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const useProducts = (filters?: { categoryId?: string; search?: string; warehouseId?: string }) =>
  useQuery({
    queryKey: ['inventory_products', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/inventory/products${query ? `?${query}` : ''}`);
    },
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['inventory_products', id],
    queryFn: () => fetchJson(`/inventory/products/${id}`),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/inventory/products', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory_products'] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/inventory/products/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_products', id] });
    },
  });
};

// ─── Stock ────────────────────────────────────────────────────────────────────

export const useStockLevels = (filters?: { warehouseId?: string; productId?: string }) =>
  useQuery({
    queryKey: ['inventory_stock', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/inventory/stock/levels${query ? `?${query}` : ''}`);
    },
  });

export const useAddStockEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/inventory/stock/entry', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_products'] });
    },
  });
};

export const useLowStockAlerts = () =>
  useQuery({
    queryKey: ['inventory_alerts_low_stock'],
    queryFn: () => fetchJson('/inventory/alerts/low-stock'),
  });
