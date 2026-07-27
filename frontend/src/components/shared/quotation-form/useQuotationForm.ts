import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { createQuotation, updateQuotation } from './quotationApi';
import type { Quotation, QuotationLineItem } from './types';

export function useQuotationForm(
  isOpen: boolean,
  quotation: Quotation | null | undefined,
  onClose: () => void,
  onQuotationSaved: () => void,
) {
  const [formData, setFormData] = useState<Quotation>({} as Quotation);
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([]);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => (await api.get('/sales/clients')).data.data || [],
  });

  const { data: templates } = useQuery({
    queryKey: ['quotation-templates'],
    queryFn: async () => (await api.get('/sales/templates')).data.data || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quotation?.id) {
      await updateQuotation(quotation.id, formData, lineItems, { profile: {}, userId: '' });
    } else {
      await createQuotation(formData, lineItems, { profile: {}, userId: '' });
    }
    onQuotationSaved();
    onClose();
  };

  return {
    loading: false, savingDraft: false, lastSaved: null, loadingClients: false,
    clients: clients || [], templates: templates || [], lineItems, formData,
    setFormData, calculateLineTotal: () => 0,
    handleLineItemChange: () => {}, addLineItem: () => {}, removeLineItem: () => {},
    applyTemplate: async () => {}, saveDraft: async () => {}, handleSubmit,
  };
}
