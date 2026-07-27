import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateTicketData } from '@/services/api/system';

interface Props {
  form: CreateTicketData;
  onChange: (f: CreateTicketData) => void;
  showStatus?: boolean;
}

export function TicketFormFields({ form, onChange, showStatus }: Props) {
  const set = (patch: Partial<CreateTicketData>) => onChange({ ...form, ...patch });
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Brief description of the issue" />
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Detailed description of the issue" rows={5} />
      </div>
      <div className={`grid gap-4 ${showStatus ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {showStatus && (
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set({ status: v as CreateTicketData['status'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => set({ priority: v as CreateTicketData['priority'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input value={form.category} onChange={e => set({ category: e.target.value })} placeholder="e.g., technical, billing" />
        </div>
      </div>
    </div>
  );
}
