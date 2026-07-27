import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AttendanceStats } from './types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface OverviewTabProps {
  stats: AttendanceStats;
  attendanceRate: number;
}

export function OverviewTab({ stats, attendanceRate }: OverviewTabProps) {
  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Late', value: stats.late },
    { name: 'Absent', value: stats.absent },
    { name: 'On Leave', value: stats.onLeave },
  ];
  const total = stats.present + stats.late + stats.absent + stats.onLeave;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
          <CardDescription>Today's attendance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%" cy="45%"
                labelLine={false} label={false}
                outerRadius={80} innerRadius={25}
                fill="#8884d8" dataKey="value" paddingAngle={3}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown, name: string) => {
                  const percent = total > 0 ? (((value as number) / total) * 100).toFixed(1) : 0;
                  return [`${value} (${percent}%)`, name];
                }}
              />
              <Legend
                verticalAlign="bottom" height={80} iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry: any) => {
                  const itemValue = entry.payload?.value || 0;
                  const percent = total > 0 ? ((itemValue / total) * 100).toFixed(1) : 0;
                  return `${value}: ${itemValue} (${percent}%)`;
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Employees</span>
              <span className="font-semibold">{total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Present Employees</span>
              <span className="font-semibold text-green-600">{stats.present}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Late Arrivals</span>
              <span className="font-semibold text-yellow-600">{stats.late}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Absent Employees</span>
              <span className="font-semibold text-red-600">{stats.absent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">On Leave</span>
              <span className="font-semibold text-blue-600">{stats.onLeave}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Attendance Rate</span>
                <span className={`text-lg font-bold ${attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {attendanceRate}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
