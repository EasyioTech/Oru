import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useScheduledReports, ScheduledReport } from '@/hooks/useScheduledReports';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ScheduledReportsPage() {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const { reports, isLoading, deleteReport, toggleActive } = useScheduledReports({ search });
  const { toast } = useToast();

  const columns: ColumnDef<ScheduledReport>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'report_type', header: 'Type', cell: ({ row }) => <Badge variant="secondary">{row.original.report_type}</Badge> },
    { accessorKey: 'schedule_type', header: 'Schedule', cell: ({ row }) => row.original.schedule_type === 'custom' ? row.original.schedule_config : row.original.schedule_type },
    { accessorKey: 'format', header: 'Format', cell: ({ row }) => row.original.format.toUpperCase() },
    { accessorKey: 'is_active', header: 'Active', cell: ({ row }) => (
      <Switch 
        checked={row.original.is_active} 
        onCheckedChange={(checked) => toggleActive.mutate({ id: row.original.id, is_active: checked })} 
      />
    )},
    { id: 'actions', cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => { if(confirm('Delete?')) deleteReport.mutate(row.original.id); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
    )},
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Reports</h1>
          <p className="text-muted-foreground">Manage automated report generation.</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={reports} />}
    </div>
  );
}
