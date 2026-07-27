import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function QuotationTemplateDialog({ open, onOpenChange, template, onSuccess }: any) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(template?.name || '');

  const { mutateAsync: saveTemplate, isPending } = useMutation({
    mutationFn: async () => {
      if (template?.id) return api.put(`/sales/templates/${template.id}`, { name });
      return api.post('/sales/templates', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-templates'] });
      toast.success('Template saved');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to save template')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{template?.id ? 'Edit' : 'Create'} Template</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Template Name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => saveTemplate()} disabled={isPending || !name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
