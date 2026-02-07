import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, HardDrive } from 'lucide-react';
import { formatBytes, formatUptime } from './utils';
import type { SystemHealth } from './types';

interface SystemTabContentProps {
  health: SystemHealth;
}

export const SystemTabContent = ({ health }: SystemTabContentProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU & Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {health.system && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Platform</p>
                    <p className="font-semibold">{health.system.platform || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Architecture</p>
                    <p className="font-semibold">{health.system.arch || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Node Version</p>
                    <p className="font-semibold">{health.system.nodeVersion || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-semibold">
                      {health.system.uptime ? formatUptime(health.system.uptime) : 'Unknown'}
                    </p>
                  </div>
                </div>
                {health.system.cpu && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">CPU</p>
                    <p className="font-semibold">{health.system.cpu.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {health.system.cpu.count} cores
                      {health.system.cpu.speed && ` @ ${health.system.cpu.speed}MHz`}
                    </p>
                  </div>
                )}
                {health.system.loadAverage && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Load Average</p>
                    <div className="flex gap-4">
                      {health.system.loadAverage.map((load, index) => (
                        <div key={index}>
                          <p className="text-xs text-muted-foreground">
                            {index === 0 ? '1min' : index === 1 ? '5min' : '15min'}
                          </p>
                          <p className="font-mono">{load.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {health.system.memory && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Memory Usage</span>
                    <span className="font-mono">{health.system.memory.usage}</span>
                  </div>
                  <Progress
                    value={health.system.memory.usagePercent || parseFloat(health.system.memory.usage)}
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold">{formatBytes(health.system.memory.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Used</p>
                    <p className="font-semibold text-orange-500">
                      {formatBytes(health.system.memory.used)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Free</p>
                    <p className="font-semibold text-green-500">
                      {formatBytes(health.system.memory.free)}
                    </p>
                  </div>
                </div>
                {health.system.disk && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-semibold">Disk Usage</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total</span>
                        <p className="font-mono">{formatBytes(health.system.disk.total || 0)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Used</span>
                        <p className="font-mono text-orange-500">
                          {formatBytes(health.system.disk.used || 0)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Free</span>
                        <p className="font-mono text-green-500">
                          {formatBytes(health.system.disk.free || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
