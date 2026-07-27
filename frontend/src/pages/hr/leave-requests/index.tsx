import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useLeaveRequests, LeaveRequest } from '@/hooks/useLeaveRequests';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Search, MoreVertical, CheckCircle, XCircle } from 'lucide-react';

export default function LeaveRequestsPage() {
  const { requests, isLoading, updateStatus } = useLeaveRequests();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || r.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<LeaveRequest>[] = [
    { accessorKey: 'employeeName', header: 'Employee' },
    { accessorKey: 'leaveType', header: 'Type' },
    { accessorKey: 'startDate', header: 'Start Date', cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString() },
    { accessorKey: 'endDate', header: 'End Date', cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString() },
    { accessorKey: 'reason', header: 'Reason' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'approved' ? 'default' : row.original.status === 'rejected' ? 'destructive' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        if (row.original.status !== 'pending') return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateStatus.mutate({ id: row.original.id, status: 'approved' })}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus.mutate({ id: row.original.id, status: 'rejected' })}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Leave Requests" description="Manage employee time off and leave requests" />

      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employee..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={filteredRequests} />}
    </div>
  );
}
