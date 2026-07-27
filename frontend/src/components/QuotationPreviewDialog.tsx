import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function QuotationPreviewDialog({ open, onOpenChange, quotation }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader><DialogTitle>Quotation Preview</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p><strong>Title:</strong> {quotation?.title}</p>
          <p><strong>Client:</strong> {quotation?.client_name}</p>
          <p><strong>Total:</strong> {quotation?.total}</p>
          {/* Add more preview details here as needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
