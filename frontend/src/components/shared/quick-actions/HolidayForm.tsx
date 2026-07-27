import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type HolidayForm as HolidayFormType } from './types';

interface Props {
  form: HolidayFormType;
  onChange: (f: HolidayFormType) => void;
}

export function HolidayForm({ form, onChange }: Props) {
  const set = (patch: Partial<HolidayFormType>) => onChange({ ...form, ...patch });
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Holiday Name *</Label>
        <Input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="e.g., New Year's Day" />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Optional description" rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.date && 'text-muted-foreground')}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.date ? format(form.date, 'PPP') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker mode="single" selected={form.date} onSelect={date => set({ date })} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-3">
        <Label>Holiday Type</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="company-holiday" checked={form.is_company_holiday}
              onCheckedChange={v => set({ is_company_holiday: v as boolean, is_national_holiday: v ? false : form.is_national_holiday })} />
            <Label htmlFor="company-holiday" className="text-sm">Company Holiday</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="national-holiday" checked={form.is_national_holiday}
              onCheckedChange={v => set({ is_national_holiday: v as boolean, is_company_holiday: v ? false : form.is_company_holiday })} />
            <Label htmlFor="national-holiday" className="text-sm">National Holiday</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
