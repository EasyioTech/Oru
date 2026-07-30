import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ActivityEvent {
  action: string;
  module?: string;
  metadata?: Record<string, any>;
}

export function useActivityTracking(workspaceId?: string) {
  const queryClient = useQueryClient();

  const trackActivity = useCallback(
    async (event: ActivityEvent) => {
      if (!workspaceId) return;

      try {
        await api.post(`/core/workspace/${workspaceId}/activity`, event);

        queryClient.invalidateQueries({
          queryKey: ['workspace-dashboard-context', workspaceId],
        });
      } catch (err) {
        console.error('Failed to track activity:', err);
      }
    },
    [workspaceId, queryClient]
  );

  return { trackActivity };
}
