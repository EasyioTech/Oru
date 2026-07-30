import { useWorkspaceProfile, useCapabilities } from '../hooks';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { BarChart3, Users, Zap, TrendingUp } from 'lucide-react';

interface WorkspaceSummaryProps {
  workspaceId?: string;
}

export function WorkspaceSummary({ workspaceId }: WorkspaceSummaryProps) {
  const { data: profile } = useWorkspaceProfile(workspaceId);
  const { data: capabilities } = useCapabilities(workspaceId);

  if (!profile || !capabilities) return null;

  const enabledModuleCount = capabilities.modules.filter((m) => m.enabled).length;
  const healthScore = profile.health_json?.score || 0;
  const teamMembers = profile.collaboration_json?.members_count || 0;
  const activeModules = Object.values(profile.modules_json || {}).filter((m: any) => m.enabled).length;

  const metrics = [
    {
      label: 'Health Score',
      value: Math.round(healthScore),
      unit: '%',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Modules',
      value: activeModules,
      unit: `of ${enabledModuleCount}`,
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Team Members',
      value: teamMembers,
      unit: 'members',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Modules',
      value: capabilities.modules.length,
      unit: 'available',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-sm text-gray-600">{metric.unit}</span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
