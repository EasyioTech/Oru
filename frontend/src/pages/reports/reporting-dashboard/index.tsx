import { useQueryState } from 'nuqs';
import { Card as TremorCard, Metric, Text, Grid, Title, Flex } from '@tremor/react';
import { useReportingDashboard } from '@/hooks/useReportingDashboard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportingDashboard() {
  const [dateFrom, setDateFrom] = useQueryState('dateFrom', { 
    defaultValue: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
  });
  const [dateTo, setDateTo] = useQueryState('dateTo', { 
    defaultValue: new Date().toISOString().split('T')[0] 
  });

  const { data, isLoading } = useReportingDashboard(dateFrom, dateTo);

  if (isLoading) return <div className="p-6">Loading dashboard...</div>;
  if (!data) return <div className="p-6">Failed to load dashboard</div>;

  const chartData = data.recent_activity?.map(activity => ({
    module: activity.module,
    count: activity.count,
  })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>Reporting Dashboard</Title>
          <Text>Overview of all modules</Text>
        </div>
        <div className="flex gap-4">
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} max={dateTo} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom} max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
      </div>

      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <TremorCard><Text>Revenue</Text><Metric>${data.financial?.revenue?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Expenses</Text><Metric>${data.financial?.expenses?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Profit</Text><Metric>${data.financial?.profit?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Pending Revenue</Text><Metric>${data.financial?.pending_revenue?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Total Products</Text><Metric>{data.inventory?.total_products?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Stock Value</Text><Metric>${data.inventory?.total_stock_value?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Total Assets</Text><Metric>{data.assets?.total_assets?.toLocaleString() || '0'}</Metric></TremorCard>
        <TremorCard><Text>Employees</Text><Metric>{data.hr?.total_employees?.toLocaleString() || '0'}</Metric></TremorCard>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
