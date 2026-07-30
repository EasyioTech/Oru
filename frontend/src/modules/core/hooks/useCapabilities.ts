import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

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
      const res = await api.get(`/core/workspace/${id}/capabilities`);
      return res.data.data as Capabilities;
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
