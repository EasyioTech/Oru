import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function ReceiptFormDialog({ open, onOpenChange, receipt, onSuccess }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(receipt || { amount: '', description: '', expense_date: '' });

  const { mutateAsync: saveReceipt, isPending } = useMutation({
    mutationFn: async () => {
      if (receipt?.id) return api.put(`/finance/receipts/${receipt.id}`, formData);
      return api.post('/finance/receipts', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast.success('Receipt saved');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to save receipt')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{receipt?.id ? 'Edit' : 'Create'} Receipt</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); saveReceipt(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={formData.expense_date} onChange={e => setFormData({ ...formData, expense_date: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
