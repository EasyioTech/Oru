import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { type EventForm as EventFormType, EVENT_TYPES, EVENT_COLORS } from './types';

interface Props {
  form: EventFormType;
  onChange: (f: EventFormType) => void;
}

export function EventForm({ form, onChange }: Props) {
  const set = (patch: Partial<EventFormType>) => onChange({ ...form, ...patch });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Event Title *</Label>
          <Input value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Enter event title" />
        </div>
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select value={form.event_type} onValueChange={v => set({ event_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Select value={form.color} onValueChange={v => set({ color: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_COLORS.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />{c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Enter event description" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />{format(form.start_date, 'PPP HH:mm')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker mode="single" selected={form.start_date} onSelect={d => d && set({ start_date: d })} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />{format(form.end_date, 'PPP HH:mm')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker mode="single" selected={form.end_date} onSelect={d => d && set({ end_date: d })} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={form.location} onChange={e => set({ location: e.target.value })} placeholder="Enter location or 'Virtual'" className="pl-9" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="all-day" checked={form.is_all_day} onCheckedChange={v => set({ is_all_day: v as boolean })} />
        <Label htmlFor="all-day" className="text-sm">All-day event</Label>
      </div>
    </div>
  );
}
