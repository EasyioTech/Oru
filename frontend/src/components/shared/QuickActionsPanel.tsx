import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar, CalendarDays, Bell, FileText, Clock, Loader2 } from 'lucide-react';
import { useQuickActions } from './quick-actions/hooks/useQuickActions';
import { EventForm } from './quick-actions/EventForm';
import { HolidayForm } from './quick-actions/HolidayForm';
import { AnnouncementForm } from './quick-actions/AnnouncementForm';
import { RecentActivity } from './quick-actions/RecentActivity';

interface Props {
  onEventCreated?: () => void;
  onHolidayCreated?: () => void;
}

const DIALOG_META = {
  event: { title: 'Create Company Event', desc: 'Schedule a new company event for all employees' },
  holiday: { title: 'Add Holiday', desc: 'Add a new holiday to the company calendar' },
  announcement: { title: 'Send Announcement', desc: 'Send a notification to all employees' },
};

const SUBMIT_LABEL = {
  event: 'Create Event',
  holiday: 'Add Holiday',
  announcement: 'Send Announcement',
};

export function QuickActionsPanel({ onEventCreated, onHolidayCreated }: Props) {
  const {
    canManageEvents, showDialog, setShowDialog, actionType,
    loading, recentActivities, openAction, handleSubmit,
    eventForm, setEventForm, holidayForm, setHolidayForm,
    announcementForm, setAnnouncementForm,
  } = useQuickActions(onEventCreated, onHolidayCreated);

  if (!canManageEvents) return null;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" /> Quick Actions
          </CardTitle>
          <CardDescription>Create events, holidays, and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors" onClick={() => openAction('event')}>
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Create Event</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-red-300 transition-colors" onClick={() => openAction('holiday')}>
              <CalendarDays className="h-6 w-6 text-red-600" />
              <span className="text-sm font-medium">Add Holiday</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors" onClick={() => openAction('announcement')}>
              <Bell className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Announcement</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 transition-colors" onClick={() => window.location.href = '/calendar'}>
              <FileText className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">View Calendar</span>
            </Button>
          </div>
          <RecentActivity activities={recentActivities} />
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{DIALOG_META[actionType].title}</DialogTitle>
            <DialogDescription>{DIALOG_META[actionType].desc}</DialogDescription>
          </DialogHeader>

          {actionType === 'event' && <EventForm form={eventForm} onChange={setEventForm} />}
          {actionType === 'holiday' && <HolidayForm form={holidayForm} onChange={setHolidayForm} />}
          {actionType === 'announcement' && <AnnouncementForm form={announcementForm} onChange={setAnnouncementForm} />}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {SUBMIT_LABEL[actionType]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QuickActionsPanel;
