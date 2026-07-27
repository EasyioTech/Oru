import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function ReimbursementFormDialog({ open, onOpenChange, request, onSuccess }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(request || { amount: '', description: '', expense_date: '' });

  const { mutateAsync: saveReimbursement, isPending } = useMutation({
    mutationFn: async () => {
      if (request?.id) return api.put(`/finance/reimbursements/${request.id}`, formData);
      return api.post('/finance/reimbursements', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      toast.success('Reimbursement saved');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to save reimbursement')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{request?.id ? 'Edit' : 'Create'} Reimbursement</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); saveReimbursement(); }} className="space-y-4">
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