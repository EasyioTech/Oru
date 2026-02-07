import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity } from 'lucide-react';
import { formatBytes } from './utils';
import type { SystemHealth } from './types';

interface PerformanceTabContentProps {
  health: SystemHealth;
}

export const PerformanceTabContent = ({ health }: PerformanceTabContentProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {health.performance.cache && (
              <>
                <div className="flex items-center justify-between">
                  <span>Cache Type</span>
                  <Badge>{health.performance.cache.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Size</span>
                  <span className="font-mono">{health.performance.cache.size} items</span>
                </div>
              </>
            )}
            {health.services.redis?.stats && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-semibold">Redis Statistics</p>
                {health.services.redis.stats.totalCommands !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Commands</span>
                    <span className="font-mono">
                      {health.services.redis.stats.totalCommands.toLocaleString()}
                    </span>
                  </div>
                )}
                {health.services.redis.stats.opsPerSec !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ops/sec</span>
                    <span className="font-mono">{health.services.redis.stats.opsPerSec}</span>
                  </div>
                )}
                {health.services.redis.stats.keyspaceHits !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cache Hits</span>
                    <span className="font-mono text-green-500">
                      {health.services.redis.stats.keyspaceHits.toLocaleString()}
                    </span>
                  </div>
                )}
                {health.services.redis.stats.keyspaceMisses !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cache Misses</span>
                    <span className="font-mono text-orange-500">
                      {health.services.redis.stats.keyspaceMisses.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Process Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {health.performance.process?.memoryUsage && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">RSS</p>
                  <p className="font-semibold">
                    {formatBytes(health.performance.process.memoryUsage.rss)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heap Total</p>
                  <p className="font-semibold">
                    {formatBytes(health.performance.process.memoryUsage.heapTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heap Used</p>
                  <p className="font-semibold text-orange-500">
                    {formatBytes(health.performance.process.memoryUsage.heapUsed)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">External</p>
                  <p className="font-semibold">
                    {formatBytes(health.performance.process.memoryUsage.external)}
                  </p>
                </div>
                {health.performance.process.memoryUsage.arrayBuffers !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Array Buffers</p>
                    <p className="font-semibold">
                      {formatBytes(health.performance.process.memoryUsage.arrayBuffers)}
                    </p>
                  </div>
                )}
              </div>
            )}
            {health.performance.process?.cpuUsage && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-2">CPU Usage</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">User</span>
                    <p className="font-mono">
                      {(health.performance.process.cpuUsage.user / 1000).toFixed(2)}s
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">System</span>
                    <p className="font-mono">
                      {(health.performance.process.cpuUsage.system / 1000).toFixed(2)}s
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
