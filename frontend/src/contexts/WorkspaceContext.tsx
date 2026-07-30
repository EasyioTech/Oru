import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceProfile } from '@/modules/core/hooks/useWorkspaceProfile';

interface WorkspaceContextType {
  workspaceId: string | null;
  profile: any;
  activeModules: string[];
  availableModules: string[];
  disabledModules: string[];
  isLoading: boolean;
  error: Error | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider = ({ children }: WorkspaceProviderProps) => {
  const { profile: userProfile } = useAuth();
  const workspaceId = (userProfile as any)?.workspaceId || (userProfile as any)?.agency_id || null;
  const { data: profile, isPending: isLoading, error } = useWorkspaceProfile(workspaceId || '');

  const value = useMemo<WorkspaceContextType>(
    () => ({
      workspaceId,
      profile,
      activeModules: profile?.modules_json?.active?.map((m: any) => m.name) || [],
      availableModules: profile?.modules_json?.available?.map((m: any) => m.name) || [],
      disabledModules: profile?.modules_json?.disabled?.map((m: any) => m.name) || [],
      isLoading,
      error,
    }),
    [workspaceId, profile, isLoading, error]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
};
