import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Server, HardDrive, Search } from 'lucide-react';

interface SystemHealth {
  services: {
    database: { status: string; latency: number };
    redis: { status: string; latency: number };
    minio: { status: string; latency: number };
    meilisearch: { status: string; latency: number };
  };
}

export default function SystemHealthPage() {
  const { user } = useAuth();
  const { data: health, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await api.get('/system/health/detailed');
      return response.data.data as SystemHealth;
    },
    refetchInterval: 10000,
  });

  if (!(user as any)?.roles?.includes('super_admin')) return <Navigate to="/" />;
  if (isLoading || !health) return <div className="p-6">Loading health...</div>;

  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'ready' || status === 'ok') return 'bg-green-500';
    if (status === 'degraded') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const services = [
    { name: 'Database', icon: Database, data: health.services?.database },
    { name: 'Redis', icon: Server, data: health.services?.redis },
    { name: 'MinIO', icon: HardDrive, data: health.services?.minio },
    { name: 'MeiliSearch', icon: Search, data: health.services?.meilisearch },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">Real-time infrastructure monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((svc) => (
          <Card key={svc.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <svc.icon className="h-4 w-4 text-muted-foreground" />
                {svc.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {svc.data ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(svc.data.status)}>
                      {svc.data.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Latency</span>
                    <span className="font-mono text-sm">{svc.data.latency || 0}ms</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">Service unavailable</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
