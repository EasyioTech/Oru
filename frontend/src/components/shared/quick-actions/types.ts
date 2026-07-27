import { addHours } from 'date-fns';
import { Users, Briefcase, Bell, CheckCircle, Calendar, ClipboardList } from 'lucide-react';

export interface EventForm {
  title: string;
  description: string;
  event_type: string;
  start_date: Date;
  end_date: Date;
  is_all_day: boolean;
  location: string;
  color: string;
}

export interface HolidayForm {
  name: string;
  description: string;
  date: Date | undefined;
  is_national_holiday: boolean;
  is_company_holiday: boolean;
}

export interface AnnouncementForm {
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export function defaultEventForm(): EventForm {
  return {
    title: '', description: '', event_type: 'meeting',
    start_date: new Date(), end_date: addHours(new Date(), 1),
    is_all_day: false, location: '', color: '#3b82f6',
  };
}

export const DEFAULT_HOLIDAY_FORM: HolidayForm = {
  name: '', description: '', date: undefined,
  is_national_holiday: false, is_company_holiday: true,
};

export const DEFAULT_ANNOUNCEMENT_FORM: AnnouncementForm = {
  title: '', message: '', priority: 'normal',
};

export const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'training', label: 'Training', icon: Briefcase },
  { value: 'announcement', label: 'Announcement', icon: Bell },
  { value: 'milestone', label: 'Milestone', icon: CheckCircle },
  { value: 'social', label: 'Social Event', icon: Calendar },
  { value: 'other', label: 'Other', icon: ClipboardList },
];

export const EVENT_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#ec4899', label: 'Pink' },
];
