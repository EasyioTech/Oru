import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Cpu, Table, Zap, BarChart3 } from 'lucide-react';
import { DatabaseHealthCard } from './DatabaseHealthCard';
import { RedisHealthCard } from './RedisHealthCard';
import { formatBytes } from './utils';
import type { SystemHealth } from './types';

interface OverviewTabContentProps {
  health: SystemHealth;
}

export const OverviewTabContent = ({ health }: OverviewTabContentProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DatabaseHealthCard health={health} compact />
        <RedisHealthCard health={health} compact />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              System Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health.system.memory ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Usage</span>
                  <span className="text-sm font-mono">{health.system.memory.usage}</span>
                </div>
                <Progress
                  value={health.system.memory.usagePercent || parseFloat(health.system.memory.usage)}
                  className="h-1.5"
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Used</span>
                    <p className="font-mono">{formatBytes(health.system.memory.used)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Free</span>
                    <p className="font-mono">{formatBytes(health.system.memory.free)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Not available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU & Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health.system.cpu && health.system.loadAverage ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Cores</span>
                  <span className="text-sm font-mono">{health.system.cpu.count}</span>
                </div>
                {health.system.loadAverage && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Load (1m)</span>
                      <span className="font-mono">{health.system.loadAverage[0]?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Load (5m)</span>
                      <span className="font-mono">{health.system.loadAverage[1]?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Load (15m)</span>
                      <span className="font-mono">{health.system.loadAverage[2]?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.database?.tables && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Table className="h-4 w-4" />
                Database Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Tables</span>
                  <span className="text-sm font-semibold">{health.database.tables.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Rows</span>
                  <span className="text-sm font-mono">
                    {health.database.tables.totalRows.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Size</span>
                  <span className="text-sm font-mono">
                    {formatBytes(health.database.tables.totalSize)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {health.database?.indexes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Indexes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Indexes</span>
                  <span className="text-sm font-semibold">{health.database.indexes.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Index Size</span>
                  <span className="text-sm font-mono">
                    {formatBytes(health.database.indexes.totalSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Usage</span>
                  <span className="text-sm font-mono">
                    {health.database.indexes.usagePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {health.database?.cache && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Cache Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Hit Ratio</span>
                  <span className="text-sm font-mono">
                    {health.database.cache.hitRatio.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={health.database.cache.hitRatio}
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground">
                  {health.database.cache.hitRatio > 95 ? 'Excellent' :
                   health.database.cache.hitRatio > 80 ? 'Good' :
                   health.database.cache.hitRatio > 60 ? 'Fair' : 'Poor'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
