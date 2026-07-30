import { useDashboardSection } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface ModuleActivityProps {
  workspaceId?: string;
}

export function ModuleActivity({ workspaceId }: ModuleActivityProps) {
  const section = useDashboardSection('module_activity', workspaceId);

  if (!section?.data?.modules?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Activity</CardTitle>
          <CardDescription>No active modules yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6 text-gray-500">
          Enable modules to track activity
        </CardContent>
      </Card>
    );
  }

  const { modules = [] } = section.data;

  const getModuleColor = (usage: number) => {
    if (usage >= 70) return 'bg-green-100';
    if (usage >= 40) return 'bg-blue-100';
    return 'bg-gray-100';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Module Activity
        </CardTitle>
        <CardDescription>Most active modules</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {modules.map((mod: any, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium capitalize">{mod.module}</span>
              <span className="text-xs text-gray-500">{mod.data_count || 0} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getModuleColor(mod.usage)}`}
                style={{ width: `${Math.min(mod.usage || 0, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
