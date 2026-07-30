import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const lineSchema = z.object({
  account_id: z.string().min(1, 'Required'),
  description: z.string(),
  debit_amount: z.coerce.number().min(0),
  credit_amount: z.coerce.number().min(0),
}).refine(data => (data.debit_amount > 0 || data.credit_amount > 0) && !(data.debit_amount > 0 && data.credit_amount > 0), {
  message: 'Must have either debit or credit',
});

const schema = z.object({
  entry_date: z.string().min(1, 'Date required'),
  description: z.string().min(1, 'Description required'),
  reference: z.string().optional(),
  status: z.enum(['draft', 'posted', 'reversed']),
  lines: z.array(lineSchema).min(2, 'At least 2 lines required'),
}).refine(data => {
  const totalDebits = data.lines.reduce((sum, line) => sum + line.debit_amount, 0);
  const totalCredits = data.lines.reduce((sum, line) => sum + line.credit_amount, 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, { message: 'Debits must equal credits', path: ['lines'] });

export default function CreateJournalEntry() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJournalEntry } = useJournalEntries();
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: async () => (await api.get('/finance/accounts')).data.data });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      description: '', reference: '', status: 'draft',
      lines: [
        { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
        { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'lines' });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createJournalEntry.mutate({
      ...data,
      lines: data.lines.map((l, i) => ({ ...l, line_number: i + 1 })) as any,
    } as any, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Journal entry created' });
        navigate('/ledger');
      },
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
    });
  };

  const lines = form.watch('lines');
  const totalDebits = lines.reduce((sum, line) => sum + (Number(line.debit_amount) || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (Number(line.credit_amount) || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/ledger')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      <h1 className="text-3xl font-bold">Create Journal Entry</h1>
      <Card>
        <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input type="date" {...form.register('entry_date')} />
                {form.formState.errors.entry_date && <p className="text-red-500 text-sm">{form.formState.errors.entry_date.message}</p>}
              </div>
              <div>
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="reversed">Reversed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Reference</Label>
                <Input {...form.register('reference')} />
              </div>
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea {...form.register('description')} />
              {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Journal Lines</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ account_id: '', description: '', debit_amount: 0, credit_amount: 0 })}>
                  <Plus className="mr-1 h-4 w-4" /> Add Line
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <Controller
                      control={form.control}
                      name={`lines.${index}.account_id`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                          <SelectContent>
                            {accounts?.map((acc: any) => <SelectItem key={acc.id} value={acc.id.toString()}>{acc.account_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <Input className="col-span-4" placeholder="Description" {...form.register(`lines.${index}.description`)} />
                  <Input className="col-span-2" type="number" step="0.01" {...form.register(`lines.${index}.debit_amount`)} />
                  <Input className="col-span-2" type="number" step="0.01" {...form.register(`lines.${index}.credit_amount`)} />
                  <Button type="button" variant="ghost" className="col-span-1" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
              
              {form.formState.errors.lines && <p className="text-red-500 text-sm">{form.formState.errors.lines.root?.message || form.formState.errors.lines.message}</p>}
              <div className="flex justify-end gap-4 font-bold">
                <div className={totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}>Debits: ₹{totalDebits.toFixed(2)}</div>
                <div className={totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}>Credits: ₹{totalCredits.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex justify-end"><Button type="submit">Create Entry</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
