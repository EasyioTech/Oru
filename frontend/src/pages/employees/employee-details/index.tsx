import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, Building, Briefcase, Calendar } from 'lucide-react';
import type { Employee } from '@/hooks/useEmployees';

export default function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading, error } = useQuery<Employee>({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await api.get(`/hr/employees/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Employee Not Found</h2>
        <p className="text-muted-foreground">The employee you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => navigate('/employee-management')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/employee-management')} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader
          title={`${employee.first_name} ${employee.last_name}`}
          description={`Employee ID: ${employee.employee_code || 'N/A'}`}
        />
        <div className="ml-auto">
          <Badge variant={employee.status === 'active' ? 'default' : employee.status === 'on_leave' ? 'secondary' : 'destructive'} className="text-sm px-3 py-1 capitalize">
            {employee.status?.replace('_', ' ') || 'Unknown'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Address</p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Phone Number</p>
                <p className="text-sm text-muted-foreground">{employee.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Department</p>
                <p className="text-sm text-muted-foreground">{employee.department_id || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Position</p>
                <p className="text-sm text-muted-foreground">{employee.position || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Hire Date</p>
                <p className="text-sm text-muted-foreground">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
