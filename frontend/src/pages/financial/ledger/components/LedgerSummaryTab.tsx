import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LedgerSummary } from '../types';

interface Props {
  summary: LedgerSummary;
  formatCurrency: (n: number) => string;
}

export function LedgerSummaryTab({ summary, formatCurrency }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
        <CardDescription>Overview of account balances and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Revenue</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(summary.monthlyIncome)}</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Expenses</h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{formatCurrency(summary.monthlyExpenses)}</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Net Income</h3>
            <p className={`text-2xl sm:text-3xl font-bold ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netProfit)}
            </p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
