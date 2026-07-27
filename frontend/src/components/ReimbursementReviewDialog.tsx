import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function ReimbursementReviewDialog({ open, onOpenChange, request, onSuccess }: any) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const { mutateAsync: reviewRequest, isPending } = useMutation({
    mutationFn: async (status: string) => api.post(`/finance/reimbursements/${request?.id}/review`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      toast.success('Review submitted');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to submit review')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Review Reimbursement</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p>Reviewing request for {request?.amount}</p>
          <Textarea placeholder="Review notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => reviewRequest('rejected')} disabled={isPending}>Reject</Button>
          <Button onClick={() => reviewRequest('approved')} disabled={isPending}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}