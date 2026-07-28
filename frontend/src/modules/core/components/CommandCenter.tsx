import { useDashboardSection } from '../hooks';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Activity, Users, Zap } from 'lucide-react';

interface CommandCenterProps {
  workspaceId?: string;
}

export function CommandCenter({ workspaceId }: CommandCenterProps) {
  const section = useDashboardSection('command_center', workspaceId);

  if (!section?.data) return null;

  const { greeting, best_action, status_indicators } = section.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{greeting?.main}</CardTitle>
        <CardDescription>{greeting?.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-xs text-gray-500">Health</div>
              <div className="font-semibold">{status_indicators?.health_score}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Team</div>
              <div className="font-semibold">{status_indicators?.team_members}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Modules</div>
              <div className="font-semibold">{status_indicators?.modules_active}</div>
            </div>
          </div>
        </div>

        {best_action && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">{best_action.label}</p>
            <Button
              asChild
              className="w-full"
              onClick={() => {
                if (best_action.action_url) window.location.href = best_action.action_url;
              }}
            >
              <span>{best_action.label}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
