import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchJson, fetchMutate } from '@/utils/authApi';
import { generateUUID } from '@/lib/uuid';
import { useAuth } from '@/hooks/useAuth';
import { getAgencyId } from '@/utils/agencyUtils';
import { ClientFormData, DRAFT_STORAGE_KEY, DEFAULT_FORM_DATA } from '../types';

export interface CreatorInfo { name: string; email: string; created_at: string }
export interface UpdaterInfo { name: string; email: string; updated_at: string }

export function useCreateClient() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientId, setClientId] = useState<string | null>(id || null);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [updaterInfo, setUpdaterInfo] = useState<UpdaterInfo | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({ ...DEFAULT_FORM_DATA });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoadingClient(true);
      try {
        const agencyId = await getAgencyId(profile, user?.id);
        if (!agencyId) {
          toast({ title: 'Error', description: 'Agency context is missing. Please re-login.', variant: 'destructive' });
          navigate('/clients');
          return;
        }
        const data = await fetchJson(`/crm/clients/${id}`);
        if (data) {
          setClientId(data.id);
          setFormData({
            name: data.name || '', company_name: data.company_name || '',
            industry: data.industry || '', email: data.email || '',
            phone: data.phone || '', address: data.address || '',
            city: data.city || '', state: data.state || '',
            postal_code: data.postal_code || '', country: data.country || '',
            website: data.website || '', contact_person: data.contact_person || '',
            contact_position: data.contact_position || '', contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '', status: data.status || 'active',
            billing_address: data.billing_address || '', billing_city: data.billing_city || '',
            billing_state: data.billing_state || '', billing_postal_code: data.billing_postal_code || '',
            billing_country: data.billing_country || '', tax_id: data.tax_id || '',
            payment_terms: data.payment_terms?.toString() || '30', notes: data.notes || '',
          });
          if (data.created_by) {
            setCreatorInfo({ name: 'System User', email: '', created_at: data.created_at || '' });
          }
          if (data.updated_at && data.updated_at !== data.created_at) {
            setUpdaterInfo({ name: 'System', email: '', updated_at: data.updated_at || '' });
          }
        }
      } catch (error: any) {
        const msg = error instanceof Error ? error.message : 'Failed to load client';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        navigate('/clients');
      } finally {
        setLoadingClient(false);
      }
    };
    load();
  }, [id, profile, user?.id, navigate, toast]);

  useEffect(() => {
    if (id) return;
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      try { setFormData(JSON.parse(saved)); setHasDraft(true); } catch { /* invalid json */ }
    }
  }, [id]);

  useEffect(() => {
    if (id) return;
    const hasData = Object.values(formData).some(v => v !== '' && v !== 'active' && v !== '30');
    if (hasData) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...formData, timestamp: new Date().toISOString() }));
      setHasDraft(true);
    }
  }, [formData, id]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setFormData({ ...DEFAULT_FORM_DATA });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Client name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) errs.contact_email = 'Please enter a valid contact email address';
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) errs.website = 'Website must start with http:// or https://';
    if (formData.payment_terms && isNaN(Number(formData.payment_terms))) errs.payment_terms = 'Payment terms must be a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId) {
        toast({ title: 'Error', description: 'Agency context is missing. Please re-login.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const base = {
        name: formData.name.trim(), company_name: formData.company_name.trim() || null,
        industry: formData.industry.trim() || null, email: formData.email.trim() || null,
        phone: formData.phone.trim() || null, address: formData.address.trim() || null,
        city: formData.city.trim() || null, state: formData.state.trim() || null,
        postal_code: formData.postal_code.trim() || null, country: formData.country.trim() || null,
        website: formData.website.trim() || null, contact_person: formData.contact_person.trim() || null,
        contact_position: formData.contact_position.trim() || null, contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null, status: formData.status,
        billing_address: formData.billing_address.trim() || null, billing_city: formData.billing_city.trim() || null,
        billing_state: formData.billing_state.trim() || null, billing_postal_code: formData.billing_postal_code.trim() || null,
        billing_country: formData.billing_country.trim() || null, tax_id: formData.tax_id.trim() || null,
        payment_terms: formData.payment_terms?.trim() || null, notes: formData.notes.trim() || null,
      };
      if (clientId) {
        const { id: _id, client_number: _cn, created_by: _cb, created_at: _ca, updated_at: _ua, ...updateData } = base as Record<string, any>;
        const res = await fetchMutate(`/crm/clients/${clientId}`, 'PUT', updateData);
        setUpdaterInfo({ name: profile?.full_name || user?.email || 'Current User', email: user?.email || '', updated_at: res?.updated_at || new Date().toISOString() });
        toast({ title: 'Success', description: 'Client updated successfully' });
      } else {
        const newId = generateUUID();
        const res = await fetchMutate('/crm/clients', 'POST', { id: newId, ...base, client_number: `CLT-${Date.now().toString(36).toUpperCase()}`, agency_id: agencyId, is_active: true, created_by: user?.id });
        clearDraft();
        setCreatorInfo({ name: profile?.full_name || user?.email || 'Current User', email: user?.email || '', created_at: res?.created_at || new Date().toISOString() });
        setClientId(newId);
        toast({ title: 'Success', description: 'Client created successfully' });
      }
      navigate('/clients');
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : 'Failed to create client';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  return {
    formData, errors, loading, loadingClient, hasDraft, clientId,
    creatorInfo, updaterInfo, isEditing: !!clientId,
    clearDraft, handleSubmit, handleInputChange,
    user, profile,
  };
}
