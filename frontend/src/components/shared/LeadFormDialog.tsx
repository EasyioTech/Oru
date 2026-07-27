import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown, Building2, User, Phone, Mail, DollarSign, Target, CalendarIcon, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchJson } from '@/utils/authApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const leadSchema = z.object({
  company_name: z.string().min(1, 'Company Name is required'),
  contact_name: z.string().min(1, 'Contact Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('new'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimated_value: z.number().optional().or(z.literal('')),
  assigned_to: z.string().optional().or(z.literal('')),
  lead_source_id: z.string().optional().or(z.literal('')),
});
type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadFormDialog({ isOpen, onClose, lead, onLeadSaved }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: async () => await fetchJson('/hr/employees') || [] });
  const { data: sources = [] } = useQuery({ queryKey: ['lead-sources'], queryFn: async () => await fetchJson('/crm/lead-sources') || [] });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { company_name: '', contact_name: '', status: 'new', priority: 'medium', estimated_value: 0 }
  });

  useEffect(() => {
    if (lead) reset({ ...lead, estimated_value: lead.estimated_value || lead.value || 0 });
    else reset({ company_name: '', contact_name: '', status: 'new', priority: 'medium', estimated_value: 0 });
  }, [lead, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: LeadFormValues) => {
      const res = await fetch(lead ? `/api/crm/leads/${lead.id}` : `/api/crm/leads`, {
        method: lead ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save lead');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Success', description: 'Lead saved successfully' });
      onLeadSaved?.();
      onClose?.();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{lead ? 'Edit Lead' : 'New Lead'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Company Name *</Label><Input {...register('company_name')} /></div>
            <div className="space-y-2"><Label>Contact Name *</Label><Input {...register('contact_name')} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" {...register('email')} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input {...register('phone')} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select {...register('priority')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                {['low', 'medium', 'high'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Est. Value</Label><Input type="number" {...register('estimated_value', { valueAsNumber: true })} /></div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <select {...register('assigned_to')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                <option value="">None</option>
                {employees.map((e: any) => <option key={e.id} value={e.user_id || e.id}>{e.full_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Lead Source</Label>
              <select {...register('lead_source_id')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                <option value="">None</option>
                {sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}