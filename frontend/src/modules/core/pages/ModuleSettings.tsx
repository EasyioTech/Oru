import { useCallback, useState } from 'react';
import { useWorkspaceProfile } from '../hooks';
import { ModuleToggle } from '../components';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

interface ModuleSettingsProps {
  workspaceId?: string;
}

export function ModuleSettings({ workspaceId }: ModuleSettingsProps) {
  const { data: profile } = useWorkspaceProfile(workspaceId);
  const [error, setError] = useState<string | null>(null);

  const handleModuleToggle = useCallback(async (moduleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enabled ? 'enable_module' : 'disable_module',
          module: moduleId,
        }),
      });

      if (!response.ok) throw new Error('Failed to update module settings');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [workspaceId]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-gray-600 mt-1">Manage modules and customize your workspace</p>
      </div>

      <Tabs defaultValue="modules" className="w-full">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          <ModuleToggle workspaceId={workspaceId} onModuleToggle={handleModuleToggle} />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Workspace ID</label>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{workspaceId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Health Score</label>
                  <div className="mt-2">
                    {profile?.health_json?.score ? (
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(profile.health_json.score)}%
                        </div>
                        <span className="text-sm text-gray-600">
                          {profile.health_json.score >= 80
                            ? 'Excellent'
                            : profile.health_json.score >= 50
                              ? 'Good'
                              : 'Needs Improvement'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No data yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
