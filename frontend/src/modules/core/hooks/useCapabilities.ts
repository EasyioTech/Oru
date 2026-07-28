import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../lib/auth';

export interface ModuleCapability {
  module: string;
  enabled: boolean;
  available: boolean;
  dataCount?: number;
  usageScore?: number;
  features?: string[];
}

export interface Capabilities {
  workspace_id: string;
  modules: ModuleCapability[];
  feature_flags?: Record<string, boolean>;
  max_users?: number;
  current_users?: number;
}

export function useCapabilities(workspaceId?: string) {
  const { user } = useAuth();
  const id = workspaceId || user?.id;

  return useQuery({
    queryKey: ['workspace-capabilities', id],
    queryFn: async () => {
      if (!id) throw new Error('No workspace ID');
      const res = await fetch(`/api/workspace/${id}/capabilities`);
      if (!res.ok) throw new Error('Failed to fetch capabilities');
      const { data } = await res.json();
      return data as Capabilities;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useIsModuleEnabled(module: string, workspaceId?: string) {
  const { data } = useCapabilities(workspaceId);
  const capability = data?.modules?.find((m) => m.module === module);
  return capability?.enabled ?? false;
}
