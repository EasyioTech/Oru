import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Plus, CheckSquare, Square } from 'lucide-react';
import { PayrollRecordCard } from './PayrollRecordCard';
import type { PayrollRecord } from '../types';

interface PayrollRecordsTabProps {
  loading: boolean;
  filteredRecords: PayrollRecord[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (v: string) => void;
  payrollPeriods: any[];
  selectedRecords: Set<string>;
  bulkActionLoading: boolean;
  onSelectRecord: (id: string) => void;
  onSelectAll: () => void;
  onBulkApprove: () => void;
  onBulkMarkPaid: () => void;
  onNewPayroll: () => void;
  onEditPayroll: (record: PayrollRecord) => void;
  onDeletePayroll: (record: PayrollRecord) => void;
  onDownloadPaySlip: (record: PayrollRecord) => void;
}

export function PayrollRecordsTab({
  loading, filteredRecords, searchTerm, setSearchTerm, selectedPeriod, setSelectedPeriod,
  payrollPeriods, selectedRecords, bulkActionLoading,
  onSelectRecord, onSelectAll, onBulkApprove, onBulkMarkPaid,
  onNewPayroll, onEditPayroll, onDeletePayroll, onDownloadPaySlip,
}: PayrollRecordsTabProps) {
  const currentPeriodName = (payrollPeriods.find((p: any) => (p as { id: string }).id === selectedPeriod) as { name?: string } | undefined)?.name;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payroll Records</CardTitle>
            <CardDescription>
              {currentPeriodName ? `Payroll for ${currentPeriodName}` : 'Select a payroll period'}
              {selectedRecords.size > 0 && <span className="ml-2 text-primary font-medium">({selectedRecords.size} selected)</span>}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedRecords.size > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={onBulkApprove} disabled={bulkActionLoading}>Approve Selected</Button>
                <Button size="sm" variant="outline" onClick={onBulkMarkPaid} disabled={bulkActionLoading}>Mark Paid</Button>
              </>
            )}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select period" /></SelectTrigger>
              <SelectContent>
                {(payrollPeriods as { id: string; name: string }[]).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading payroll data...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No payroll records found matching your search.' : 'No payroll records found for the selected period.'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={onNewPayroll}>
                  <Plus className="mr-2 h-4 w-4" />Create First Payroll Record
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 pb-2 border-b">
                <Button size="sm" variant="ghost" onClick={onSelectAll} className="h-8">
                  {selectedRecords.size === filteredRecords.length
                    ? <CheckSquare className="h-4 w-4 mr-2" />
                    : <Square className="h-4 w-4 mr-2" />}
                  Select All
                </Button>
              </div>
              {filteredRecords.map(record => (
                <PayrollRecordCard
                  key={record.id}
                  record={record}
                  selected={selectedRecords.has(record.id)}
                  onSelect={onSelectRecord}
                  onEdit={onEditPayroll}
                  onDelete={onDeletePayroll}
                  onDownloadPaySlip={onDownloadPaySlip}
                />
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
