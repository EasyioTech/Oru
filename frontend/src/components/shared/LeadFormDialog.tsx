import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Mail, DollarSign, Target, Briefcase } from 'lucide-react';
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

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeadFormValues>({
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

  // Premium UI tokens derived from settings/dashboard
  const inputStyle = "h-11 bg-zinc-50 border-zinc-200/80 rounded-xl focus-visible:ring-zinc-200 shadow-sm transition-all dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:focus-visible:ring-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400";
  const selectTriggerStyle = "h-11 bg-zinc-50 border-zinc-200/80 rounded-xl focus:ring-zinc-200 shadow-sm transition-all dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:focus:ring-zinc-800 dark:text-zinc-100 text-left";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl p-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Rich Header */}
        <SheetHeader className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10 text-left">
            <div className="w-12 h-12 rounded-[14px] bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
              {lead ? <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {lead ? 'Edit Lead' : 'New Lead'}
              </SheetTitle>
              <SheetDescription className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
                {lead ? 'Update lead details and pipeline status.' : 'Add a new prospective client to your pipeline.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          <form id="lead-form" onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-10">
            
            {/* Section 1: Core Details */}
            <div className="space-y-5">
              <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-wide uppercase">
                <Building2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Company Name *</Label>
                  <Input {...register('company_name')} className={inputStyle} placeholder="e.g. Acme Corp" />
                  {errors.company_name && <p className="text-xs text-red-500 font-medium ml-1">{errors.company_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Contact Name *</Label>
                  <Input {...register('contact_name')} className={inputStyle} placeholder="e.g. Jane Doe" />
                  {errors.contact_name && <p className="text-xs text-red-500 font-medium ml-1">{errors.contact_name.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Contact Info */}
            <div className="space-y-5 pt-5 border-t border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-wide uppercase">
                <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Email</Label>
                  <Input type="email" {...register('email')} className={inputStyle} placeholder="jane@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Phone</Label>
                  <Input {...register('phone')} className={inputStyle} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* Section 3: Pipeline & Value */}
            <div className="space-y-5 pt-5 border-t border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-wide uppercase">
                <DollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                Pipeline Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Status</Label>
                  <Controller name="status" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Priority</Label>
                  <Controller name="priority" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {['low', 'medium', 'high'].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Estimated Value</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₹</span>
                    <Input type="number" {...register('estimated_value', { valueAsNumber: true })} className={`${inputStyle} pl-8`} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Assigned To</Label>
                  <Controller name="assigned_to" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((e: any) => (
                          <SelectItem key={e.id} value={e.user_id || e.id}>{e.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider ml-1">Lead Source</Label>
                  <Controller name="lead_source_id" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/80 shrink-0 flex justify-end gap-3 backdrop-blur-md relative z-10">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-6 h-11 font-semibold dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:bg-zinc-900 border-zinc-200 hover:bg-zinc-100 transition-colors">
            Cancel
          </Button>
          <Button type="submit" form="lead-form" disabled={isSubmitting} className="rounded-xl px-8 h-11 font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg shadow-black/10 dark:shadow-white/10 transition-all">
            {isSubmitting ? 'Saving...' : 'Save Lead'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}