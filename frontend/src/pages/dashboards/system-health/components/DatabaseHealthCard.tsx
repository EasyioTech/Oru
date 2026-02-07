import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database } from 'lucide-react';
import { getStatusBadge } from './StatusBadge';
import { formatBytes } from './utils';
import type { SystemHealth } from './types';

interface DatabaseHealthCardProps {
  health: SystemHealth;
  compact?: boolean;
  /** Show connection pool section. Default true for full view. */
  showPool?: boolean;
  /** Override card title. Default: "Database" (compact) or "Database Connection" (full) */
  title?: string;
}

export const DatabaseHealthCard = ({ health, compact = false, showPool = true, title }: DatabaseHealthCardProps) => {
  const db = health.services.database;
  if (!db) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Not available</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              {getStatusBadge(db.status)}
            </div>
            {db.responseTime !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Response Time</span>
                <span className="text-sm font-mono">{db.responseTime}ms</span>
              </div>
            )}
            {db.connections && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-mono">
                    {db.connections.current}/{db.connections.max}
                  </span>
                </div>
                <Progress value={parseFloat(db.connections.usage)} className="h-1.5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const fullTitle = title ?? 'Database Connection';
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {fullTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status</span>
          {getStatusBadge(db.status)}
        </div>
        {db.responseTime !== undefined && (
          <div className="flex items-center justify-between">
            <span>Response Time</span>
            <span className="font-mono">{db.responseTime}ms</span>
          </div>
        )}
        {db.size && (
          <div className="flex items-center justify-between">
            <span>Database Size</span>
            <span className="font-mono">{formatBytes(db.size)}</span>
          </div>
        )}
        {db.connections && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Connections</span>
              <span className="font-mono">
                {db.connections.current} / {db.connections.max}
              </span>
            </div>
            <Progress value={parseFloat(db.connections.usage)} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{db.connections.usage} usage</p>
          </div>
        )}
        {db.pool && showPool && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-semibold">Connection Pool</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Active</span>
                <p className="font-mono">{db.pool.active}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Idle</span>
                <p className="font-mono">{db.pool.idle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Idle in TX</span>
                <p className="font-mono">{db.pool.idleInTransaction}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Waiting</span>
                <p className="font-mono text-orange-500">{db.pool.waiting}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
