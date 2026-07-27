import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function RoleDashboard({ role }: { role: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', role],
    queryFn: async () => (await api.get(`/dashboards/${role}`)).data.data || {}
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-8" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(stats).map(([key, value]) => (
        <Card key={key}>
          <CardHeader><CardTitle className="capitalize">{key.replace(/_/g, ' ')}</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{String(value)}</p></CardContent>
        </Card>
      ))}
      {Object.keys(stats).length === 0 && <p className="col-span-3 text-center text-muted-foreground">No data available</p>}
    </div>
  );
}
