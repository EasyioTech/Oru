import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '../types';
import { TransactionRow } from './TransactionRow';

interface Props {
  title: string;
  description: string;
  transactions: Transaction[];
  typeFilter?: 'credit' | 'debit';
  searchTerm: string;
  formatCurrency: (n: number) => string;
}

const BG_CLASS: Record<string, string> = {
  credit: 'bg-green-100',
  debit: 'bg-red-100',
};

export function TransactionList({ title, description, transactions, typeFilter, searchTerm, formatCurrency }: Props) {
  const filtered = typeFilter ? transactions.filter(t => t.type === typeFilter) : transactions;
  const empty = typeFilter
    ? `No ${typeFilter} transactions found.`
    : searchTerm ? 'No transactions found matching your search.' : 'No transactions found.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-8"><p className="text-muted-foreground">{empty}</p></div>
          ) : (
            filtered.map(t => (
              <TransactionRow key={t.id} transaction={t} bgClass={typeFilter ? BG_CLASS[typeFilter] : 'bg-primary/10'} formatCurrency={formatCurrency} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
