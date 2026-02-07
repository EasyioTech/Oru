import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, BarChart3, Lock } from 'lucide-react';
import { DatabaseHealthCard } from './DatabaseHealthCard';
import { formatBytes, formatDuration } from './utils';
import type { SystemHealth } from './types';

interface DatabaseTabContentProps {
  health: SystemHealth;
}

export const DatabaseTabContent = ({ health }: DatabaseTabContentProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DatabaseHealthCard health={health} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {health.database ? (
              <>
                {health.database.tables && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Tables</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Count</span>
                        <p className="font-semibold">{health.database.tables.count}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Rows</span>
                        <p className="font-mono">
                          {health.database.tables.totalRows.toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Total Size</span>
                        <p className="font-mono">{formatBytes(health.database.tables.totalSize)}</p>
                      </div>
                    </div>
                  </div>
                )}
                {health.database.indexes && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-semibold">Indexes</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Count</span>
                        <p className="font-semibold">{health.database.indexes.count}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size</span>
                        <p className="font-mono">{formatBytes(health.database.indexes.totalSize)}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Usage</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={health.database.indexes.usagePercent}
                            className="h-2 flex-1"
                          />
                          <span className="font-mono text-xs">
                            {health.database.indexes.usagePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {health.database.queries && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-semibold">Active Queries</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Active</span>
                        <p className="font-mono">{health.database.queries.active}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Idle in TX</span>
                        <p className="font-mono">{health.database.queries.idleInTransaction}</p>
                      </div>
                      {health.database.queries.longestQuerySeconds > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Longest Query</span>
                          <p className="font-mono text-orange-500">
                            {formatDuration(health.database.queries.longestQuerySeconds)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {health.database.locks && health.database.locks.waiting > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {health.database.locks.waiting} Waiting Locks
                      </span>
                    </div>
                  </div>
                )}
                {health.database.cache && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-semibold">Cache Hit Ratio</p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={health.database.cache.hitRatio}
                        className="h-2 flex-1"
                      />
                      <span className="font-mono text-sm">
                        {health.database.cache.hitRatio.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
                {health.database.replication && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Replication Role</span>
                      <Badge variant="outline">
                        {health.database.replication.role}
                      </Badge>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Performance metrics not available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
