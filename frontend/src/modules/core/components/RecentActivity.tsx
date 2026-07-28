import { useDashboardSection } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Clock } from 'lucide-react';

interface RecentActivityProps {
  workspaceId?: string;
}

export function RecentActivity({ workspaceId }: RecentActivityProps) {
  const section = useDashboardSection('recent_activity', workspaceId);

  if (!section?.data?.activities?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest workspace actions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6 text-gray-500">
          No activity yet
        </CardContent>
      </Card>
    );
  }

  const { activities = [] } = section.data;

  const formatTime = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest workspace actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity: any, i: number) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{activity.action}</p>
                {activity.module && (
                  <p className="text-xs text-gray-500 capitalize">{activity.module}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">{formatTime(activity.timestamp)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
