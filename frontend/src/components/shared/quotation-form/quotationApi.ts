import { api } from '@/lib/api';
import type { QuotationLineItem, Quotation } from './types';

export interface QuotationSaveContext {
  profile: any;
  userId: string;
}

export async function createQuotation(
  formData: Quotation,
  lineItems: QuotationLineItem[],
  ctx: QuotationSaveContext,
): Promise<void> {
  await api.post('/sales/quotations', { formData, lineItems });
}

export async function updateQuotation(
  quotationId: string,
  formData: Quotation,
  lineItems: QuotationLineItem[],
  ctx: QuotationSaveContext,
): Promise<void> {
  await api.put(`/sales/quotations/${quotationId}`, { formData, lineItems });
}
