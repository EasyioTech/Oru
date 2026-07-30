import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayments, Payment } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  paymentDate: z.string().min(1, 'Date is required'),
  amount: z.number().min(0.01, 'Amount must be > 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentFormDialog({
  isOpen, onClose, payment, invoiceId
}: { isOpen: boolean; onClose: () => void; payment?: Payment | null; invoiceId?: string | null }) {
  const { createPayment, updatePayment } = usePayments();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { invoiceId: invoiceId || '', paymentDate: new Date().toISOString().split('T')[0], amount: 0, paymentMethod: 'bank_transfer' }
  });

  useEffect(() => {
    if (payment) {
      reset({
        invoiceId: payment.invoiceId, paymentDate: payment.paymentDate,
        amount: payment.amount, paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber || '', notes: payment.notes || ''
      });
    } else {
      reset({ invoiceId: invoiceId || '', paymentDate: new Date().toISOString().split('T')[0], amount: 0, paymentMethod: 'bank_transfer' });
    }
  }, [payment, invoiceId, reset, isOpen]);

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      if (payment) {
        await updatePayment.mutateAsync({ id: payment.id, data: { ...data, status: 'completed' } });
        toast({ title: 'Success', description: 'Payment updated successfully' });
      } else {
        await createPayment.mutateAsync({ ...(data as any), status: 'completed' });
        toast({ title: 'Success', description: 'Payment recorded successfully' });
      }
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to record payment', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{payment ? 'Edit Payment' : 'Record Payment'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Invoice ID *</Label>
            <Input {...register('invoiceId')} disabled={!!invoiceId || !!payment} />
            {errors.invoiceId && <p className="text-xs text-red-500">{errors.invoiceId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...register('paymentDate')} />
              {errors.paymentDate && <p className="text-xs text-red-500">{errors.paymentDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <select {...register('paymentMethod')} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Reference Number</Label>
            <Input {...register('referenceNumber')} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
