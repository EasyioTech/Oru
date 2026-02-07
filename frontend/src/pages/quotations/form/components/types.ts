export interface QuotationLineItem {
  id: string;
  quotation_id?: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  line_total?: number;
  sort_order?: number;
}

export interface Quotation {
  id?: string;
  quote_number?: string;
  quotation_number?: string;
  client_id: string;
  template_id?: string | null;
  title: string;
  description?: string;
  status: string;
  issue_date?: string;
  expiry_date?: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount?: number;
  total_amount: number;
  terms_conditions?: string;
  terms_and_conditions?: string;
  notes?: string;
  created_by?: string;
  agency_id?: string;
}

export interface Client {
  id: string;
  name: string;
  company_name?: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  template_data?: Record<string, unknown>;
}
