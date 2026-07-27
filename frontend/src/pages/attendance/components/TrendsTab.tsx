import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WeeklyTrend } from './types';

interface TrendsTabProps {
  trends: WeeklyTrend[];
  period: 'week' | 'month';
}

export function TrendsTab({ trends, period }: TrendsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>{period === 'week' ? 'Last 7 days' : 'Last 30 days'} attendance pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" strokeWidth={2} />
            <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" strokeWidth={2} />
            <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" strokeWidth={2} />
            <Line type="monotone" dataKey="attendanceRate" stroke="#3b82f6" name="Attendance Rate %" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
