import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export interface Greeting {
  main: string;
  subtitle: string;
}

export interface DashboardSection {
  type: 'command_center' | 'workspace_health' | 'module_activity' | 'workspace_progress' | 'recent_activity';
  data: Record<string, any>;
}

export interface DashboardContext {
  greeting: Greeting;
  status: string;
  sections: DashboardSection[];
  needs_setup: boolean;
}

export function useDashboardContext(workspaceId?: string) {
  const { user, profile } = useAuth();
  const id = workspaceId || (profile as any)?.workspaceId || (profile as any)?.agency_id || user?.id;

  return useQuery({
    queryKey: ['dashboard-context', id],
    queryFn: async () => {
      if (!id) throw new Error('No workspace ID');
      const res = await api.get(`/core/workspace/${id}/dashboard-context`);
      return res.data.data as DashboardContext;

    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboard changes frequently)
  });
}

export function useDashboardSection(type: DashboardSection['type'], workspaceId?: string) {
  const { data } = useDashboardContext(workspaceId);
  return data?.sections?.find((s) => s.type === type);
}
