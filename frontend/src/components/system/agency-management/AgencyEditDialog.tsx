import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { AgencyDetails } from '@/services/api/agencies';

interface Props {
  open: boolean;
  onClose: () => void;
  agency: AgencyDetails | null;
  form: Partial<AgencyDetails>;
  onChange: (form: Partial<AgencyDetails>) => void;
  isUpdating: boolean;
  onSubmit: () => void;
}

export function AgencyEditDialog({ open, onClose, agency, form, onChange, isUpdating, onSubmit }: Props) {
  const set = (patch: Partial<AgencyDetails>) => onChange({ ...form, ...patch });
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Agency</DialogTitle>
          <DialogDescription>Update agency information and settings</DialogDescription>
        </DialogHeader>
        {agency && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Agency Name</Label>
              <Input id="edit-name" value={form.name || ''} onChange={e => set({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-domain">Domain</Label>
              <Input id="edit-domain" value={form.domain || ''} onChange={e => set({ domain: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <Select value={form.subscription_plan} onValueChange={value => set({ subscription_plan: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max-users">Max Users</Label>
                <Input
                  id="edit-max-users"
                  type="number"
                  value={form.max_users || ''}
                  onChange={e => set({ max_users: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={form.is_active || false}
                onChange={e => set({ is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-active">Agency is active</Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isUpdating}>
            {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
