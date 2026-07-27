import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface JournalEntryLine {
  id?: string;
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  line_number: number;
}

export interface JournalEntry {
  id?: string;
  entry_number?: string;
  entry_date: string;
  description: string;
  reference?: string;
  status: 'draft' | 'posted' | 'reversed';
  total_debit?: number;
  total_credit?: number;
  lines: JournalEntryLine[];
}

export function useJournalEntries() {
  const queryClient = useQueryClient();

  const { data: journalEntries, isLoading, error } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const response = await api.get('/finance/journal-entries');
      return response.data.data as JournalEntry[];
    },
  });

  const createJournalEntry = useMutation({
    mutationFn: async (data: JournalEntry) => {
      const response = await api.post('/finance/journal-entries', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });

  return {
    journalEntries: journalEntries || [],
    isLoading,
    error,
    createJournalEntry
  };
}
