import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { getAssignableRoles, ROLE_DISPLAY_NAMES, AppRole } from '@/utils/roleUtils';
import type { NewRequestForm } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  form: NewRequestForm;
  onChange: (form: NewRequestForm) => void;
  employees: Array<{ user_id: string; full_name: string; email: string }>;
  creating: boolean;
  userRole: AppRole;
  onSubmit: () => void;
}

export function CreateRequestDialog({ open, onClose, form, onChange, employees, creating, userRole, onSubmit }: Props) {
  const set = (patch: Partial<NewRequestForm>) => onChange({ ...form, ...patch });
  const assignableRoles = getAssignableRoles(userRole);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create Role Change Request</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Employee <span className="text-destructive">*</span></Label>
            <Select value={form.user_id} onValueChange={v => set({ user_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.user_id} value={e.user_id}>
                    {e.full_name} {e.email && <span className="text-muted-foreground text-xs">({e.email})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Requested Role <span className="text-destructive">*</span></Label>
            <Select value={form.requested_role} onValueChange={v => set({ requested_role: v as AppRole })}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {assignableRoles.map(role => (
                  <SelectItem key={role} value={role}>{ROLE_DISPLAY_NAMES[role] || role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea placeholder="Reason for role change request..." value={form.reason} onChange={e => set({ reason: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={creating}>Cancel</Button>
          <Button onClick={onSubmit} disabled={creating || !form.user_id || !form.requested_role}>
            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
