import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const journalSchema = z.object({
  entry_date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'posted', 'reversed']).default('draft'),
  lines: z.array(z.object({
    account_id: z.string().min(1, 'Account is required'),
    description: z.string().optional().or(z.literal('')),
    debit_amount: z.number().default(0),
    credit_amount: z.number().default(0),
  })).min(2, 'At least 2 lines required')
}).refine(data => {
  const totalDebits = data.lines.reduce((acc, curr) => acc + (curr.debit_amount || 0), 0);
  const totalCredits = data.lines.reduce((acc, curr) => acc + (curr.credit_amount || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, { message: "Debits must equal credits", path: ["lines"] });

type JournalFormValues = z.infer<typeof journalSchema>;

export default function JournalEntryFormDialog({ isOpen, onClose, entry, onEntrySaved }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: async () => (await fetch('/api/finance/bank-accounts')).json().then(r => r.data || []) });

  const { register, control, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: { entry_date: new Date().toISOString().split('T')[0], description: '', status: 'draft', lines: [{ account_id: '', debit_amount: 0, credit_amount: 0 }, { account_id: '', debit_amount: 0, credit_amount: 0 }] }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines = watch("lines");

  useEffect(() => {
    if (entry) reset(entry);
    else reset({ entry_date: new Date().toISOString().split('T')[0], description: '', status: 'draft', lines: [{ account_id: '', debit_amount: 0, credit_amount: 0 }, { account_id: '', debit_amount: 0, credit_amount: 0 }] });
  }, [entry, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: JournalFormValues) => {
      const res = await fetch(entry ? `/api/finance/journal-entries/${entry.id}` : `/api/finance/journal-entries`, {
        method: entry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save journal entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({ title: 'Success', description: 'Entry saved' });
      onEntrySaved?.();
      onClose?.();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
  });
  
  const totalDebits = lines?.reduce((acc, curr) => acc + (curr.debit_amount || 0), 0) || 0;
  const totalCredits = lines?.reduce((acc, curr) => acc + (curr.credit_amount || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{entry ? 'Edit Entry' : 'New Entry'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Date *</Label><Input type="date" {...register('entry_date')} /></div>
            <div className="space-y-2"><Label>Reference</Label><Input {...register('reference')} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                {['draft', 'posted', 'reversed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2"><Label>Description *</Label><Textarea {...register('description')} /></div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Lines</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ account_id: '', description: '', debit_amount: 0, credit_amount: 0 })}><Plus className="h-4 w-4 mr-1"/> Add</Button>
            </div>
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <select {...register(`lines.${i}.account_id` as const)} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                    <option value="">Select Account</option>
                    {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.account_name || a.name || a.bank_name}</option>)}
                  </select>
                </div>
                <div className="col-span-3"><Input placeholder="Desc" {...register(`lines.${i}.description` as const)} /></div>
                <div className="col-span-2"><Input type="number" step="0.01" {...register(`lines.${i}.debit_amount` as const, { valueAsNumber: true })} /></div>
                <div className="col-span-2"><Input type="number" step="0.01" {...register(`lines.${i}.credit_amount` as const, { valueAsNumber: true })} /></div>
                <div className="col-span-1"><Button type="button" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-red-500"/></Button></div>
              </div>
            ))}
            {errors.lines?.root && <p className="text-red-500 text-sm">{errors.lines.root.message}</p>}
            <div className="flex justify-between font-bold">
              <span>Totals:</span>
              <span>Debits: {totalDebits.toFixed(2)} | Credits: {totalCredits.toFixed(2)}</span>
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
