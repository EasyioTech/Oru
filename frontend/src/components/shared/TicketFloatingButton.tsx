import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useUIPreferences } from '@/hooks/useUIPreferences';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['error', 'feature', 'ui', 'performance', 'other']).default('error'),
});

export function TicketFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { showSupportTicketButton } = useUIPreferences();
  
  if (!showSupportTicketButton) {
    return null;
  }
  
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: '', description: '', priority: 'medium' as const, category: 'error' as const }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      let res = await fetch('/api/system/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      if (!res.ok) {
        res = await fetch('/api/notifications', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, type: 'ticket' })
        });
      }
      if (!res.ok) throw new Error('Failed to create ticket');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Ticket created successfully' });
      setIsOpen(false);
      reset();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
  });

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"><HelpCircle /></Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report an Issue</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea {...register('description')} rows={4} />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Priority</Label>
                <select {...register('priority')} className="flex h-10 w-full rounded-md border px-3">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Category</Label>
                <select {...register('category')} className="flex h-10 w-full rounded-md border px-3">
                  {['error', 'feature', 'ui', 'performance', 'other'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
