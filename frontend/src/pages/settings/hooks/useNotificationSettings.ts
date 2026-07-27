import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  leave_notifications: boolean;
  payroll_notifications: boolean;
  project_updates: boolean;
  system_alerts: boolean;
  marketing_emails: boolean;
}

export const useNotificationSettings = () => {
  const queryClient = useQueryClient();

  const { data: notificationSettings, isLoading: loading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/notifications');
      return response.data.data as NotificationSettings;
    },
    initialData: {
      email_notifications: true,
      push_notifications: false,
      task_reminders: true,
      leave_notifications: true,
      payroll_notifications: true,
      project_updates: true,
      system_alerts: true,
      marketing_emails: false,
    },
  });

  const { mutateAsync: saveNotificationSettings } = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      await api.put('/settings/notifications', settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });

  return {
    notificationSettings,
    loading,
    saveNotificationSettings,
  };
};
