import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useReportExports, ReportExport } from '@/hooks/useReportExports';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReportExportsPage() {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const { exports, isLoading, deleteExport } = useReportExports({ search, status });
  const { toast } = useToast();

  const columns: ColumnDef<ReportExport>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'report_type', header: 'Type', cell: ({ row }) => <Badge variant="secondary">{row.original.report_type}</Badge> },
    { accessorKey: 'format', header: 'Format', cell: ({ row }) => <span className="uppercase">{row.original.format}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
        const s = row.original.status;
        const v = s === 'pending' ? 'secondary' : s === 'processing' ? 'outline' : s === 'completed' ? 'default' : 'destructive';
        return <Badge variant={v as any}>{s}</Badge>;
    }},
    { accessorKey: 'generated_at', header: 'Generated', cell: ({ row }) => new Date(row.original.generated_at).toLocaleString() },
    { id: 'actions', cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          {row.original.status === 'completed' && (
            <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Download started' })}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => { if(confirm('Delete?')) deleteExport.mutate(row.original.id); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
    )},
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Report Exports</h1>
          <p className="text-muted-foreground">Manage and download exported reports.</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search exports..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </CardContent>
      </Card>
      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={exports} />}
    </div>
  );
}
