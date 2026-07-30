import { useDashboardContext, useWorkspaceProfile } from '../hooks';
import { CommandCenter, WorkspaceHealth, ModuleActivity, RecentActivity, OnboardingFlow, QuickWins, WorkspaceSummary } from '../components';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface AdaptiveDashboardProps {
  workspaceId?: string;
}

export function AdaptiveDashboard({ workspaceId }: AdaptiveDashboardProps) {
  const { data: context, isLoading, error } = useDashboardContext(workspaceId);
  const { data: profile } = useWorkspaceProfile(workspaceId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load workspace dashboard</span>
      </div>
    );
  }

  if (!context) {
    return <div className="text-center text-gray-500 py-8">No workspace data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <WorkspaceSummary workspaceId={workspaceId} />

      {/* Onboarding Flow */}
      <OnboardingFlow workspaceId={workspaceId} />

      {/* Top Section: Greeting + Key Action */}
      <CommandCenter workspaceId={workspaceId} />

      {/* Quick Wins */}
      <QuickWins workspaceId={workspaceId} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health + Activity */}
        <div className="lg:col-span-2 space-y-6">
          <WorkspaceHealth workspaceId={workspaceId} />
          <ModuleActivity workspaceId={workspaceId} />
        </div>

        {/* Right Column: Recent Activity */}
        <div>
          <RecentActivity workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
