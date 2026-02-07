export interface SystemHealth {
  timestamp: string;
  status: string;
  cached?: boolean;
  services: {
    database?: {
      status: string;
      responseTime?: number;
      size?: number;
      connections?: {
        current: number;
        max: number;
        usage: string;
      };
      pool?: {
        active: number;
        idle: number;
        idleInTransaction: number;
        waiting: number;
      };
    };
    redis?: {
      status: string;
      responseTime?: number;
      cacheSize?: number;
      memory?: {
        used?: number;
        usedHuman?: string;
        peak?: number;
        peakHuman?: string;
      };
      stats?: {
        totalCommands?: number;
        keyspaceHits?: number;
        keyspaceMisses?: number;
        opsPerSec?: number;
      };
      clients?: {
        connected?: number;
        blocked?: number;
      };
      fallback?: string;
    };
  };
  system: {
    platform?: string;
    arch?: string;
    nodeVersion?: string;
    uptime?: number;
    memory?: {
      total: number;
      used: number;
      free: number;
      usage: string;
      usagePercent?: number;
    };
    cpu?: {
      count: number;
      model: string;
      speed?: number;
    };
    loadAverage?: number[];
    disk?: {
      total?: number;
      free?: number;
      used?: number;
    };
  };
  performance: {
    cache?: {
      type: string;
      size: number;
    };
    process?: {
      memoryUsage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers?: number;
      };
      cpuUsage?: {
        user: number;
        system: number;
      };
    };
  };
  database?: {
    tables?: {
      count: number;
      totalRows: number;
      totalSize: number;
    };
    indexes?: {
      count: number;
      totalSize: number;
      usagePercent: number;
    };
    queries?: {
      active: number;
      idleInTransaction: number;
      longestQuerySeconds: number;
    };
    locks?: {
      waiting: number;
    };
    cache?: {
      hitRatio: number;
    };
    replication?: {
      role: string;
    };
  };
  trends?: {
    available: boolean;
    hourly?: unknown[];
  };
}
