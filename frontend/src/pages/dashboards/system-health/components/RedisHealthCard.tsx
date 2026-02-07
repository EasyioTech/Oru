import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server } from 'lucide-react';
import { getStatusBadge } from './StatusBadge';
import { formatBytes } from './utils';
import type { SystemHealth } from './types';

interface RedisHealthCardProps {
  health: SystemHealth;
  compact?: boolean;
}

export const RedisHealthCard = ({ health, compact = false }: RedisHealthCardProps) => {
  const redis = health.services.redis;
  if (!redis) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Redis Cache
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
            <Server className="h-4 w-4" />
            Redis Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              {getStatusBadge(redis.status)}
            </div>
            {redis.responseTime !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Response Time</span>
                <span className="text-sm font-mono">{redis.responseTime}ms</span>
              </div>
            )}
            {redis.cacheSize !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cache Size</span>
                <span className="text-sm font-mono">{redis.cacheSize} keys</span>
              </div>
            )}
            {redis.memory?.usedHuman && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Memory</span>
                <span className="text-sm font-mono">{redis.memory.usedHuman}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Redis Cache Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status</span>
          {getStatusBadge(redis.status)}
        </div>
        {redis.responseTime !== undefined && (
          <div className="flex items-center justify-between">
            <span>Response Time</span>
            <span className="font-mono">{redis.responseTime}ms</span>
          </div>
        )}
        {redis.cacheSize !== undefined && (
          <div className="flex items-center justify-between">
            <span>Cache Size</span>
            <span className="font-mono">{redis.cacheSize} keys</span>
          </div>
        )}
        {redis.memory && (
          <>
            <div className="flex items-center justify-between">
              <span>Memory Used</span>
              <span className="font-mono">
                {redis.memory.usedHuman || formatBytes(redis.memory.used || 0)}
              </span>
            </div>
            {redis.memory.peak && (
              <div className="flex items-center justify-between">
                <span>Memory Peak</span>
                <span className="font-mono">
                  {redis.memory.peakHuman || formatBytes(redis.memory.peak)}
                </span>
              </div>
            )}
          </>
        )}
        {redis.clients && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-semibold">Clients</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Connected</span>
                <p className="font-mono">{redis.clients.connected || 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Blocked</span>
                <p className="font-mono text-orange-500">{redis.clients.blocked || 0}</p>
              </div>
            </div>
          </div>
        )}
        {redis.fallback && (
          <Badge variant="outline" className="w-full justify-center">
            Fallback: {redis.fallback}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
