import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useReimbursements, ReimbursementRequest } from '@/hooks/useReimbursements';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ReimbursementFormDialog } from '@/components/shared/ReimbursementFormDialog';
import { ReimbursementReviewDialog } from '@/components/ReimbursementReviewDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReimbursementsPage() {
  const { reimbursements, isLoading, deleteReimbursement, updateReimbursement } = useReimbursements();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const [selectedRequest, setSelectedRequest] = useState<ReimbursementRequest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredRequests = reimbursements.filter((r) => {
    const matchesSearch = r.description.toLowerCase().includes(search.toLowerCase()) || 
                          r.profiles?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || r.status === status;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => updateReimbursement.mutate({ id, data: { status: 'approved' } });
  const handleReject = (id: string) => updateReimbursement.mutate({ id, data: { status: 'rejected' } });

  const columns: ColumnDef<ReimbursementRequest>[] = [
    { accessorKey: 'expense_date', header: 'Date', cell: ({ row }) => format(new Date(row.original.expense_date), "MMM dd, yyyy") },
    { accessorKey: 'profiles.full_name', header: 'Employee', cell: ({ row }) => row.original.profiles?.full_name || 'Unknown' },
    { accessorKey: 'expense_categories.name', header: 'Category', cell: ({ row }) => row.original.expense_categories?.name || 'Unknown' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `${row.original.currency} ${Number(row.original.amount).toFixed(2)}` },
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
          {row.original.status === 'submitted' && (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleApprove(row.original.id)}>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleReject(row.original.id)}>
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => { setSelectedRequest(row.original); setIsReviewOpen(true); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedRequest(row.original); setIsFormOpen(true); }}>
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
        title="Reimbursements"
        description="Manage and track reimbursement requests"
        actions={
          <Button size="sm" className="h-8 sm:h-9 gap-1.5 text-xs sm:text-sm" onClick={() => { setSelectedRequest(null); setIsFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> New Request
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={filteredRequests} />}

      <ReimbursementFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => { setIsFormOpen(false); setSelectedRequest(null); }}
        request={selectedRequest}
      />
      
      <ReimbursementReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        onSuccess={() => { setIsReviewOpen(false); setSelectedRequest(null); }}
        request={selectedRequest}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => { deleteReimbursement.mutate(deleteId!); setDeleteId(null); }}
        itemType="Reimbursement"
        itemName="this request"
      />
    </div>
  );
}