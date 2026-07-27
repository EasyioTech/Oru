import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

export interface Lead {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  status: string;
  priority: string;
  value?: number;
  notes?: string;
  [key: string]: any;
}

export interface Activity {
  id: string;
  subject: string;
  activity_type: string;
  status: string;
  [key: string]: any;
}

export function useLeadDetail(leadId: string) {
  const qc = useQueryClient();
  const enabled = !!leadId;

  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => fetchJson(`/crm/leads/${leadId}`) as Promise<Lead>,
    enabled,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: () => fetchJson(`/crm/activities?leadId=${leadId}`) as Promise<Activity[]>,
    enabled,
  });

  const updateLead = useMutation({
    mutationFn: (data: Partial<Lead>) => fetchMutate(`/crm/leads/${leadId}`, 'PUT', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead', leadId] })
  });

  const convertLead = useMutation({
    mutationFn: () => fetchMutate(`/crm/leads/${leadId}/convert`, 'POST'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead', leadId] })
  });

  return { lead, leadLoading, activities, activitiesLoading, updateLead, convertLead };
}
