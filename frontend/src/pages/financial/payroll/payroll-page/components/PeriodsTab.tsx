import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface PeriodsTabProps {
  payrollPeriods: unknown[];
  onNewPeriod: () => void;
  onEditPeriod: (period: unknown) => void;
  onDeletePeriod: (period: unknown) => void;
}

function getPeriodBadgeVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'paid' || status === 'approved') return 'default';
  if (status === 'processing') return 'secondary';
  return 'outline';
}

export function PeriodsTab({ payrollPeriods, onNewPeriod, onEditPeriod, onDeletePeriod }: PeriodsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payroll Periods</CardTitle>
            <CardDescription>Manage payroll periods for organizing payroll records</CardDescription>
          </div>
          <Button onClick={onNewPeriod}>
            <Plus className="mr-2 h-4 w-4" />New Period
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payrollPeriods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payroll periods found. Create your first period to get started.</p>
            </div>
          ) : (
            (payrollPeriods as { id: string; name: string; start_date: string; end_date: string; pay_date?: string; status: string }[]).map(period => (
              <div key={period.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{period.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                    </p>
                    {period.pay_date && (
                      <p className="text-xs text-muted-foreground">Pay Date: {new Date(period.pay_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPeriodBadgeVariant(period.status)}>{period.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => onEditPeriod(period)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDeletePeriod(period)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
