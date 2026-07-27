import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calculator, Users, Calendar } from 'lucide-react';
import type { PayrollSummary } from '../types';

interface PayrollStatsCardsProps {
  summary: PayrollSummary;
}

export function PayrollStatsCards({ summary }: PayrollStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{summary.totalEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
              <p className="text-2xl font-bold">₹{summary.totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Average Salary</p>
              <p className="text-2xl font-bold">₹{summary.averageSalary.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{summary.pendingPayroll}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
