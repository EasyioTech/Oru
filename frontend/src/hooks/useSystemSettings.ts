import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SystemSettings {
  [key: string]: any;
}

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await api.get('/system/settings');
      return response.data.data.settings as SystemSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await api.put('/system/settings', newSettings);
      return response.data.data.settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  return {
    settings: settings || {},
    isLoading,
    error,
    updateSettings,
  };
}
