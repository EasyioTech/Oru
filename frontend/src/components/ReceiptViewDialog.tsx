import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ReceiptViewDialog({ open, onOpenChange, receipt }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>View Receipt</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p><strong>Amount:</strong> {receipt?.amount}</p>
          <p><strong>Date:</strong> {receipt?.date || receipt?.expense_date}</p>
          <p><strong>Description:</strong> {receipt?.description}</p>
          {receipt?.receiptUrl && (
            <img src={receipt.receiptUrl} alt="Receipt" className="max-w-full rounded border" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
