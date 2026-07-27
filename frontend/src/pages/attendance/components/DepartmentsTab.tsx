import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DepartmentStats } from './types';

interface DepartmentsTabProps {
  departmentStats: DepartmentStats[];
}

export function DepartmentsTab({ departmentStats }: DepartmentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <CardDescription>Attendance breakdown by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {departmentStats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="late" fill="#f59e0b" name="Late" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {departmentStats.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{dept.department}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{dept.present + dept.late}/{dept.total}</span>
                      <Badge variant={dept.attendanceRate >= 90 ? 'default' : dept.attendanceRate >= 70 ? 'secondary' : 'destructive'}>
                        {dept.attendanceRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No department data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
