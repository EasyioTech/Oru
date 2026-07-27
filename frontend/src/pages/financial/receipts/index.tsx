import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useReceipts, Receipt } from '@/hooks/useReceipts';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ReceiptFormDialog } from '@/components/shared/ReceiptFormDialog';
import { ReceiptViewDialog } from '@/components/ReceiptViewDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function ReceiptsPage() {
  const { receipts, isLoading, deleteReceipt } = useReceipts();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch = r.vendor.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || r.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<Receipt>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'vendor', header: 'Vendor' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `₹${row.original.amount.toFixed(2)}` },
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => format(new Date(row.original.date), "MMM dd, yyyy") },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'approved' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedReceipt(row.original); setIsViewOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedReceipt(row.original); setIsFormOpen(true); }}>
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
        title="Receipts"
        description="Manage expense receipts and reimbursements"
        actions={
          <Button size="sm" className="h-8 sm:h-9 gap-1.5 text-xs sm:text-sm" onClick={() => { setSelectedReceipt(null); setIsFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Add Expense
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search receipts..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={filteredReceipts} />}

      <ReceiptFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => { setIsFormOpen(false); setSelectedReceipt(null); }}
        receipt={selectedReceipt}
      />
      
      <ReceiptViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        receipt={selectedReceipt}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => { deleteReceipt.mutate(deleteId!); setDeleteId(null); }}
        itemType="Receipt"
        itemName={receipts.find(r => r.id === deleteId)?.vendor || ''}
      />
    </div>
  );
}
