import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Download, Loader2 } from 'lucide-react';
import { useLedger } from './hooks/useLedger';
import { LedgerStatsCards } from './components/LedgerStatsCards';
import { TransactionList } from './components/TransactionList';
import { LedgerSummaryTab } from './components/LedgerSummaryTab';

export default function LedgerPage() {
  const {
    loading, error, ledgerSummary, filteredTransactions,
    searchTerm, setSearchTerm, profile,
    fetchLedgerData, handleExportLedger, handleAddTransaction,
    formatCurrency,
  } = useLedger();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {!profile?.agency_id ? 'Waiting for user profile...' : 'Loading ledger...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchLedgerData} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">General Ledger</h1>
          <p className="text-muted-foreground">Track all financial transactions and account balances</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExportLedger} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
          <Button onClick={handleAddTransaction} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      <LedgerStatsCards summary={ledgerSummary} formatCurrency={formatCurrency} />

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="debits">Debits</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TransactionList
            title="Transaction History"
            description="Complete record of all financial transactions"
            transactions={filteredTransactions}
            searchTerm={searchTerm}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="credits" className="mt-4">
          <TransactionList
            title="Credit Transactions"
            description="All incoming payments and credits"
            transactions={filteredTransactions}
            typeFilter="credit"
            searchTerm={searchTerm}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="debits" className="mt-4">
          <TransactionList
            title="Debit Transactions"
            description="All outgoing payments and debits"
            transactions={filteredTransactions}
            typeFilter="debit"
            searchTerm={searchTerm}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <LedgerSummaryTab summary={ledgerSummary} formatCurrency={formatCurrency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
