import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays } from 'lucide-react';

interface Props {
  activities: any[];
}

export function RecentActivity({ activities }: Props) {
  if (!activities.length) return null;
  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Activity</h4>
      <div className="space-y-2">
        {activities.slice(0, 3).map((activity, i) => {
          const a = activity as { type: string; title?: string; name?: string };
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              {a.type === 'event'
                ? <Calendar className="h-4 w-4 text-blue-500" />
                : <CalendarDays className="h-4 w-4 text-red-500" />}
              <span className="truncate">{a.title || a.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {a.type === 'event' ? 'Event' : 'Holiday'}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
