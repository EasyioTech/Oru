export interface ClientFormData {
  name: string;
  company_name: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  website: string;
  contact_person: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  tax_id: string;
  payment_terms: string;
  notes: string;
}

export const DRAFT_STORAGE_KEY = 'client_form_draft';

export const DEFAULT_FORM_DATA: ClientFormData = {
  name: '',
  company_name: '',
  industry: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  website: '',
  contact_person: '',
  contact_position: '',
  contact_email: '',
  contact_phone: '',
  status: 'active',
  billing_address: '',
  billing_city: '',
  billing_state: '',
  billing_postal_code: '',
  billing_country: '',
  tax_id: '',
  payment_terms: '30',
  notes: '',
};
