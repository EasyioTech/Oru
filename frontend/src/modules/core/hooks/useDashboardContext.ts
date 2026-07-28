import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../lib/auth';

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
  const { user } = useAuth();
  const id = workspaceId || user?.id;

  return useQuery({
    queryKey: ['dashboard-context', id],
    queryFn: async () => {
      if (!id) throw new Error('No workspace ID');
      const res = await fetch(`/api/workspace/${id}/dashboard-context`);
      if (!res.ok) throw new Error('Failed to fetch dashboard context');
      const { data } = await res.json();
      return data as DashboardContext;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboard changes frequently)
  });
}

export function useDashboardSection(type: DashboardSection['type'], workspaceId?: string) {
  const { data } = useDashboardContext(workspaceId);
  return data?.sections?.find((s) => s.type === type);
}
