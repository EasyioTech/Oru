import { useMemo } from 'react';
import { useCapabilities, useWorkspaceProfile } from './index';

export interface NavModule {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
  available: boolean;
  status: 'active' | 'available' | 'disabled';
  dataCount?: number;
  usageScore?: number;
}

const MODULE_CONFIG: Record<string, { label: string; path: string }> = {
  crm: { label: 'CRM', path: '/crm' },
  hr: { label: 'HR', path: '/hr' },
  projects: { label: 'Projects', path: '/projects' },
  finance: { label: 'Finance', path: '/finance' },
  inventory: { label: 'Inventory', path: '/inventory' },
  procurement: { label: 'Procurement', path: '/procurement' },
  reports: { label: 'Reports', path: '/reports' },
  admin: { label: 'Admin', path: '/admin' },
};

export function useAdaptiveNav(workspaceId?: string) {
  const { data: capabilities } = useCapabilities(workspaceId);
  const { data: profile } = useWorkspaceProfile(workspaceId);

  const navModules = useMemo(() => {
    if (!capabilities) return [];

    return capabilities.modules
      .map((cap) => {
        const config = MODULE_CONFIG[cap.module];
        if (!config) return null;

        let status: 'active' | 'available' | 'disabled' = 'disabled';
        if (cap.enabled && (cap.dataCount || 0) > 0) status = 'active';
        else if (cap.enabled) status = 'available';

        return {
          id: cap.module,
          label: config.label,
          path: config.path,
          enabled: cap.enabled,
          available: cap.available,
          status,
          dataCount: cap.dataCount,
          usageScore: cap.usageScore,
        };
      })
      .filter((m) => m !== null) as NavModule[];
  }, [capabilities]);

  const activeModules = useMemo(() => navModules.filter((m) => m.status === 'active'), [navModules]);
  const availableModules = useMemo(() => navModules.filter((m) => m.status === 'available'), [navModules]);
  const disabledModules = useMemo(() => navModules.filter((m) => m.status === 'disabled'), [navModules]);

  return { navModules, activeModules, availableModules, disabledModules };
}
