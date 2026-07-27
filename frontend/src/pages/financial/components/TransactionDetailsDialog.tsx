import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrencySymbol } from '../utils/financialFormatters';

interface Account {
  id: string;
  account_code: string;
  account_name: string;
}

interface Line {
  id?: string;
  account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
}

interface Transaction {
  entry_number: string;
  entry_date: string;
  status: string;
  description?: string;
  reference?: string;
  lines?: Line[];
  total_debit?: number;
  total_credit?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  chartOfAccounts: Account[];
  onEditEntry: (t: Transaction) => void;
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction, chartOfAccounts, onEditEntry }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>Journal Entry: {transaction?.entry_number || 'N/A'}</DialogDescription>
        </DialogHeader>
        {transaction && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entry Date</p>
                <p className="text-sm font-semibold">{new Date(transaction.entry_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge>{transaction.status}</Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{transaction.description || 'N/A'}</p>
              </div>
              {transaction.reference && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Reference</p>
                  <p className="text-sm">{transaction.reference}</p>
                </div>
              )}
            </div>

            {transaction.lines && transaction.lines.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3 block">Journal Entry Lines</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Account</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Debit</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaction.lines.map((line, index) => {
                        const account = chartOfAccounts.find(acc => acc.id === line.account_id);
                        return (
                          <tr key={line.id || index} className="border-t">
                            <td className="px-4 py-2 text-sm">
                              {account ? `${account.account_code} - ${account.account_name}` : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm">{line.description || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              {line.debit_amount > 0 ? formatCurrencySymbol(line.debit_amount) : '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {line.credit_amount > 0 ? formatCurrencySymbol(line.credit_amount) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-muted font-semibold">
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-sm">Total</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrencySymbol(transaction.total_debit || 0)}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrencySymbol(transaction.total_credit || 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {transaction && (
            <Button onClick={() => { onOpenChange(false); onEditEntry(transaction); }}>
              Edit Entry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
