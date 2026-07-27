import type { Transaction } from '../types';
import { getTransactionIcon, getTransactionColor, getCategoryColor, safeDate } from '../utils';

interface Props {
  transaction: Transaction;
  bgClass?: string;
  formatCurrency: (n: number) => string;
}

export function TransactionRow({ transaction: t, bgClass = 'bg-primary/10', formatCurrency }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className={`w-10 h-10 ${bgClass} rounded-full flex items-center justify-center flex-shrink-0`}>
          {getTransactionIcon(t.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{t.description}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="truncate">{t.id.substring(0, 8)}</span>
            <span>•</span>
            <span className="truncate">Ref: {t.reference}</span>
          </div>
          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getCategoryColor(t.category)}`}>
            {t.category}
          </span>
        </div>
      </div>
      <div className="text-left sm:text-right flex-shrink-0">
        <p className={`font-bold text-lg ${getTransactionColor(t.type)}`}>
          {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
        </p>
        <p className="text-sm text-muted-foreground">Balance: {formatCurrency(t.balance)}</p>
        <p className="text-xs text-muted-foreground">{safeDate(t.date)}</p>
      </div>
    </div>
  );
}
