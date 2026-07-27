import { TrendingUp, CheckCircle } from 'lucide-react';
import type { TicketStats } from '@/services/api/system';

interface Props { stats: TicketStats | null; }

export function TicketStatsOverview({ stats }: Props) {
  if (!stats) return null;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-red-600">{stats.open}</div><div className="text-xs text-muted-foreground">Open</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div><div className="text-xs text-muted-foreground">In Progress</div></div>
        <div className="text-center"><div className="text-2xl font-bold text-green-600">{stats.resolved}</div><div className="text-xs text-muted-foreground">Resolved</div></div>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Today's Activity</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-600" /><span className="text-sm">New: {stats.newToday}</span></div>
          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm">Resolved: {stats.resolvedToday}</span></div>
        </div>
        {stats.avgResolutionTime > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">Avg Resolution Time: {stats.avgResolutionTime.toFixed(1)} hours</div>
        )}
      </div>
    </>
  );
}
