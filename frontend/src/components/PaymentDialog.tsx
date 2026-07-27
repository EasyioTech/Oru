import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: any) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(invoice?.balance || '');

  const { mutateAsync: processPayment, isPending } = useMutation({
    mutationFn: async () => api.post(`/finance/invoices/${invoice?.id}/pay`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment processed');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to process payment')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Process Payment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => processPayment()} disabled={isPending || !amount}>Pay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}