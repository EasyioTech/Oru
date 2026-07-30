import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState<{title: string, message: string, type: string, priority: string, userIds: string[], category: string, actionUrl?: string, expiresAt?: string}>({ title: '', message: '', type: 'info', priority: 'normal', userIds: [], category: 'general' });
  const [markingRead, setMarkingRead] = useState(false);
  const [sending, setSending] = useState(false);
  
  const isAdmin = (user as any)?.roles?.includes('super_admin') || (user as any)?.roles?.includes('admin');

  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data || [];
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data || [];
    },
    enabled: !!isAdmin
  });

  const { mutateAsync: handleMarkAsRead } = useMutation({
    mutationFn: async (id: string) => api.put(`/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutateAsync: handleDeleteNotification } = useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = (allIds: string[]) => {
    if (selectedNotifications.size === allIds.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(allIds));
    }
  };

  return {
    notifications: notifications || [],
    filteredNotifications: notifications || [],
    unreadCount: (notifications || []).filter((n: any) => !n.read_at).length,
    loadingNotifications,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter,
    priorityFilter, setPriorityFilter,
    selectedNotifications, setSelectedNotifications,
    deleteDialogOpen, setDeleteDialogOpen,
    notificationToDelete, setNotificationToDelete,
    sendDialogOpen, setSendDialogOpen,
    sendForm, setSendForm,
    markingRead, setMarkingRead,
    sending, setSending,
    isAdmin, users: users || [],
    handleMarkAsRead,
    handleDeleteNotification,
    handleMarkAllAsRead: () => {},
    handleBulkDelete: () => {},
    handleBulkMarkAsRead: () => {},
    handleSendNotification: () => {},
    handleNotificationClick: () => {},
    toggleSelection,
    toggleSelectAll,
  };
}
