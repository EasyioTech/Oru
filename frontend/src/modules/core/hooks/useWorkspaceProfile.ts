import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export interface WorkspaceProfile {
  workspace_id: string;
  modules_json?: Record<string, any>;
  collaboration_json?: Record<string, any>;
  adoption_json?: Record<string, any>;
  health_json?: Record<string, any>;
  recommendations_json?: Array<any>;
  quick_wins_json?: Array<any>;
  created_at?: string;
  updated_at?: string;
}

export function useWorkspaceProfile(workspaceId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const id = workspaceId || user?.id;

  return useQuery({
    queryKey: ['workspace-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('No workspace ID');
      const res = await fetch(`/api/workspace/${id}/profile`);
      if (!res.ok) throw new Error('Failed to fetch workspace profile');
      const { data } = await res.json();
      return data as WorkspaceProfile;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInvalidateWorkspaceProfile(workspaceId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const id = workspaceId || user?.id;

  return () => {
    if (id) queryClient.invalidateQueries({ queryKey: ['workspace-profile', id] });
  };
}
