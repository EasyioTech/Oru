import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ActivityEvent {
  action: string;
  module?: string;
  metadata?: Record<string, unknown>;
}

export function useActivityTracking(workspaceId?: string) {
  const queryClient = useQueryClient();

  const trackActivity = useCallback(
    async (event: ActivityEvent) => {
      if (!workspaceId) return;

      try {
        await fetch(`/api/workspace/${workspaceId}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

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
