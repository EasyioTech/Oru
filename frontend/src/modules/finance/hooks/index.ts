import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Journal Entries ──────────────────────────────────────────────────────────

export const useJournalEntries = (filters?: { status?: string; dateFrom?: string; dateTo?: string }) =>
  useQuery({
    queryKey: ['finance_journal', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/finance/journal${query ? `?${query}` : ''}`);
    },
  });

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/finance/journal', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance_journal'] }),
  });
};

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const useBudgets = (filters?: { status?: string; period?: string }) =>
  useQuery({
    queryKey: ['finance_budgets', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/finance/budgets${query ? `?${query}` : ''}`);
    },
  });

export const useBudget = (id: string) =>
  useQuery({
    queryKey: ['finance_budgets', id],
    queryFn: () => fetchJson(`/finance/budgets/${id}`),
    enabled: !!id,
  });

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/finance/budgets', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance_budgets'] }),
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/finance/budgets/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance_budgets'] });
      queryClient.invalidateQueries({ queryKey: ['finance_budgets', id] });
    },
  });
};

// ─── Currencies ────────────────────────────────────────────────────────────────

export const useCurrencies = () =>
  useQuery({
    queryKey: ['finance_currencies'],
    queryFn: () => fetchJson('/finance/currencies'),
    staleTime: 1000 * 60 * 60, // exchange rates — 1hr cache
  });

export const useConvertCurrency = () =>
  useMutation({
    mutationFn: (data: { amount: number; from_currency: string; to_currency: string }) =>
      fetchMutate('/finance/currencies/convert', 'POST', data),
  });

// ─── Finance Metrics ───────────────────────────────────────────────────────────

export const useFinanceMetrics = (filters?: { period?: string }) =>
  useQuery({
    queryKey: ['finance_metrics', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/finance/metrics${query ? `?${query}` : ''}`);
    },
  });
