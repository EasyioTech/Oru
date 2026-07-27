import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { defaultEventForm, DEFAULT_HOLIDAY_FORM, DEFAULT_ANNOUNCEMENT_FORM } from '../types';

export function useQuickActions(onEventCreated?: () => void, onHolidayCreated?: () => void) {
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'event' | 'holiday' | 'announcement'>('event');

  const { data: recentActivities, isLoading: loading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => (await api.get('/hr/activities/recent')).data.data || [],
  });

  const handleSubmit = async () => {
    // Mock implementation for Quick Actions submission
    setShowDialog(false);
    if (actionType === 'event' && onEventCreated) onEventCreated();
    if (actionType === 'holiday' && onHolidayCreated) onHolidayCreated();
  };

  return {
    canManageEvents: true,
    showDialog, setShowDialog,
    actionType, setActionType,
    loading,
    recentActivities: recentActivities || [],
    openAction: (type: any) => { setActionType(type); setShowDialog(true); },
    handleSubmit,
    eventForm: defaultEventForm(), setEventForm: () => {},
    holidayForm: DEFAULT_HOLIDAY_FORM, setHolidayForm: () => {},
    announcementForm: DEFAULT_ANNOUNCEMENT_FORM, setAnnouncementForm: () => {},
  };
}
