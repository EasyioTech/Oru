import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClients, Client } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function ClientFormDialog({
  isOpen, onClose, client
}: { isOpen: boolean; onClose: () => void; client?: Client | null }) {
  const { createClient, updateClient } = useClients();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', phone: '', companyName: '', status: 'active' }
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name, email: client.email || '', phone: client.phone || '',
        companyName: client.companyName || '', status: client.status
      });
    } else {
      reset({ name: '', email: '', phone: '', companyName: '', status: 'active' });
    }
  }, [client, reset, isOpen]);

  const onSubmit = async (data: ClientFormValues) => {
    try {
      if (client) {
        await updateClient.mutateAsync({ id: client.id, data });
        toast({ title: 'Success', description: 'Client updated successfully' });
      } else {
        await createClient.mutateAsync(data as any);
        toast({ title: 'Success', description: 'Client created successfully' });
      }
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save client', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input {...register('companyName')} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select {...register('status')} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
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