import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';

export function useNotifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data || [];
    },
  });

  const { mutateAsync: handleMarkAsRead } = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutateAsync: handleDeleteNotification } = useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return {
    notifications: notifications || [],
    filteredNotifications: notifications || [],
    unreadCount: (notifications || []).filter((n: any) => !n.read_at).length,
    loadingNotifications,
    activeTab, setActiveTab,
    handleMarkAsRead,
    handleDeleteNotification,
    handleMarkAllAsRead: () => {},
    handleBulkDelete: () => {},
    handleBulkMarkAsRead: () => {},
    handleSendNotification: () => {},
  };
}
