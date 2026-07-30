import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import { Card as TremorCard, Metric, Text, Grid } from '@tremor/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { metrics, isLoading } = useAdminMetrics();

  if (!(user as any)?.roles?.includes('super_admin')) return <Navigate to="/" />;

  if (isLoading) return <div className="p-6">Loading metrics...</div>;
  if (!metrics) return <div className="p-6">Failed to load metrics.</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">High-level KPIs and trends.</p>
      </div>

      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <TremorCard>
          <Text>Total Agencies</Text>
          <Metric>{metrics.totalAgencies}</Metric>
        </TremorCard>
        <TremorCard>
          <Text>Active Agencies</Text>
          <Metric>{metrics.activeAgencies}</Metric>
        </TremorCard>
        <TremorCard>
          <Text>Total Users</Text>
          <Metric>{metrics.totalUsers}</Metric>
        </TremorCard>
        <TremorCard>
          <Text>Total Revenue</Text>
          <Metric>
            ${Object.values(metrics.revenueByPlan || {}).reduce((a, b) => a + b, 0).toLocaleString()}
          </Metric>
        </TremorCard>
      </Grid>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agencies by Plan</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.agenciesByPlan || []}>
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(metrics.revenueByPlan || {}).map(([plan, revenue]) => ({ plan, revenue }))}
              >
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
