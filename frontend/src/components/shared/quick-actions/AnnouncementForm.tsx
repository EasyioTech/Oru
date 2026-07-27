import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell } from 'lucide-react';
import { type AnnouncementForm as AnnouncementFormType } from './types';

interface Props {
  form: AnnouncementFormType;
  onChange: (f: AnnouncementFormType) => void;
}

export function AnnouncementForm({ form, onChange }: Props) {
  const set = (patch: Partial<AnnouncementFormType>) => onChange({ ...form, ...patch });
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Announcement title" />
      </div>
      <div className="space-y-2">
        <Label>Message *</Label>
        <Textarea value={form.message} onChange={e => set({ message: e.target.value })} placeholder="Enter your announcement message" rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={form.priority} onValueChange={v => set({ priority: v as AnnouncementFormType['priority'] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low"><Badge variant="outline" className="text-gray-600">Low</Badge></SelectItem>
            <SelectItem value="normal"><Badge variant="outline" className="text-blue-600">Normal</Badge></SelectItem>
            <SelectItem value="high"><Badge variant="outline" className="text-orange-600">High</Badge></SelectItem>
            <SelectItem value="urgent"><Badge variant="destructive">Urgent</Badge></SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <Bell className="h-4 w-4 inline-block mr-2" />
        This announcement will be sent as a notification to all active users.
      </div>
    </div>
  );
}
