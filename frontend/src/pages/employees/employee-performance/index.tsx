import { useState } from 'react';
import { useEmployeePerformance } from '@/hooks/useEmployeePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';

export default function EmployeePerformance() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('monthly');
  const { summary, tasks, isLoading } = useEmployeePerformance(user?.id || null, period);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Performance"
        description="View your performance metrics and task history"
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-8 sm:h-9 text-xs sm:text-sm"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{summary?.tasksCompleted || 0}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{summary?.completionRate || 0}%</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Work Hours</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{summary?.totalWorkHours || 0}h</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{summary?.attendanceRate || 0}%</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Task Performance</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Completion</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {tasks?.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>{t.completion_status}</TableCell>
                  </TableRow>
                ))}
                {(!tasks || tasks.length === 0) && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No tasks found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
