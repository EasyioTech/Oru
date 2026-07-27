import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown, CalendarIcon, DollarSign, Calculator, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchJson } from '@/utils/authApi';

const payrollSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  payroll_period_id: z.string().min(1, 'Period is required'),
  base_salary: z.number().default(0),
  overtime_pay: z.number().default(0),
  bonuses: z.number().default(0),
  deductions: z.number().default(0),
  tax_deductions: z.number().default(0),
  hours_worked: z.number().default(0),
  overtime_hours: z.number().default(0),
  status: z.enum(['draft', 'approved', 'paid']).default('draft'),
  notes: z.string().optional().or(z.literal('')),
});
type PayrollFormValues = z.infer<typeof payrollSchema>;

export default function PayrollFormDialog({ isOpen, onClose, payroll, onPayrollSaved, payrollPeriodId }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: async () => await fetchJson('/hr/employees') || [] });
  const { data: periods = [] } = useQuery({ queryKey: ['payroll-periods'], queryFn: async () => await fetchJson('/hr/payroll-periods') || [] });

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: { status: 'draft', payroll_period_id: payrollPeriodId || '', base_salary: 0 }
  });

  const vals = watch();
  const grossPay = (vals.base_salary || 0) + (vals.overtime_pay || 0) + (vals.bonuses || 0);
  const netPay = grossPay - (vals.deductions || 0) - (vals.tax_deductions || 0);

  useEffect(() => {
    if (payroll) reset(payroll);
    else reset({ status: 'draft', payroll_period_id: payrollPeriodId || '', base_salary: 0, overtime_pay: 0, bonuses: 0, deductions: 0, tax_deductions: 0 });
  }, [payroll, payrollPeriodId, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: PayrollFormValues) => {
      const payload = { ...data, gross_salary: grossPay, net_salary: netPay };
      const res = await fetch(payroll ? `/api/hr/payroll/${payroll.id}` : `/api/hr/payroll`, {
        method: payroll ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save payroll');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({ title: 'Success', description: 'Saved successfully' });
      onPayrollSaved?.();
      onClose?.();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{payroll ? 'Edit' : 'New'} Payroll</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <select {...register('employee_id')} className="flex h-10 w-full rounded-md border px-3">
                <option value="">Select...</option>
                {employees.map((e: any) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Period *</Label>
              <select {...register('payroll_period_id')} className="flex h-10 w-full rounded-md border px-3">
                <option value="">Select...</option>
                {periods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Base Salary</Label><Input type="number" step="0.01" {...register('base_salary', { valueAsNumber: true })} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border px-3">
                {['draft', 'approved', 'paid'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2"><Label>Overtime</Label><Input type="number" step="0.01" {...register('overtime_pay', { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Bonus</Label><Input type="number" step="0.01" {...register('bonuses', { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Deduct</Label><Input type="number" step="0.01" {...register('deductions', { valueAsNumber: true })} /></div>
            <div className="space-y-2"><Label>Tax</Label><Input type="number" step="0.01" {...register('tax_deductions', { valueAsNumber: true })} /></div>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Gross: ₹{grossPay.toFixed(2)}</span>
            <span>Net: ₹{netPay.toFixed(2)}</span>
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
