import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import type { LedgerSummary } from '../types';

interface Props {
  summary: LedgerSummary;
  formatCurrency: (n: number) => string;
}

export function LedgerStatsCards({ summary, formatCurrency }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="overflow-hidden">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">Total Balance</p>
              <p className="text-xl sm:text-2xl font-bold truncate" title={formatCurrency(summary.totalBalance)}>
                {formatCurrency(summary.totalBalance)}
              </p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">Monthly Income</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 truncate" title={formatCurrency(summary.monthlyIncome)}>
                {formatCurrency(summary.monthlyIncome)}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">Monthly Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 truncate" title={formatCurrency(summary.monthlyExpenses)}>
                {formatCurrency(summary.monthlyExpenses)}
              </p>
            </div>
            <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">Net Profit</p>
              <p className={`text-xl sm:text-2xl font-bold truncate ${summary.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}
                title={formatCurrency(summary.netProfit)}>
                {formatCurrency(summary.netProfit)}
              </p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
