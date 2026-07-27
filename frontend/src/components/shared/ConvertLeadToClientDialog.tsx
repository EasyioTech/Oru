import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ConvertLeadToClientDialog({ isOpen, onClose, lead, onConverted }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: lead?.company_name || '', email: lead?.email || '', phone: lead?.phone || '' });

  const { mutateAsync: convertLead, isPending } = useMutation({
    mutationFn: async () => api.post(`/crm/leads/${lead?.id}/convert`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Converted to client');
      onConverted?.();
      onClose();
    },
    onError: () => toast.error('Failed to convert')
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Convert Lead to Client</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); convertLead(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Convert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
