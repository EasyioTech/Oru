import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { usePayments, Payment } from '@/hooks/usePayments';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PaymentFormDialog from '@/components/shared/PaymentFormDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function PaymentsPage() {
  const { payments, isLoading, deletePayment } = usePayments();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.referenceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || p.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'invoiceId', header: 'Invoice' },
    { accessorKey: 'paymentDate', header: 'Date', cell: ({ row }) => new Date(row.original.paymentDate).toLocaleDateString() },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `₹${row.original.amount.toLocaleString()}` },
    { accessorKey: 'paymentMethod', header: 'Method' },
    { accessorKey: 'referenceNumber', header: 'Reference' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'completed' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedPayment(row.original); setIsFormOpen(true); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        description="Track and manage incoming payments"
        actions={
          <Button size="sm" className="h-8 sm:h-9 gap-1.5 text-xs sm:text-sm" onClick={() => { setSelectedPayment(null); setIsFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Record Payment
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search references..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={filteredPayments} />}

      <PaymentFormDialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedPayment(null); }}
        payment={selectedPayment}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => { deletePayment.mutate(deleteId!); setDeleteId(null); }}
        itemType="Payment"
        itemName="Payment"
      />
    </div>
  );
}
