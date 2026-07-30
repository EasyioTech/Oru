import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useAdminAgencies, AdminAgency } from '@/hooks/useAdminAgencies';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function AgencyDataViewer() {
  const { user } = useAuth();
  const { agencies, isLoading, updateAgencyStatus } = useAdminAgencies();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [selectedAgency, setSelectedAgency] = useState<AdminAgency | null>(null);

  if (!(user as any)?.roles?.includes('super_admin')) return <Navigate to="/" />;

  const filteredAgencies = agencies.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<AdminAgency>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'plan', header: 'Plan' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    { accessorKey: 'userCount', header: 'Users' },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Active',
      cell: ({ row }) => (
        <Switch
          checked={row.original.status === 'active'}
          onCheckedChange={(checked) =>
            updateAgencyStatus.mutate({
              id: row.original.id,
              status: checked ? 'active' : 'suspended',
            })
          }
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agencies</h1>
        <p className="text-muted-foreground">View and manage platform agencies.</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agencies..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredAgencies}
        />
      )}

      <Sheet open={!!selectedAgency} onOpenChange={(open) => !open && setSelectedAgency(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedAgency?.name}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-sm text-muted-foreground">{selectedAgency?.plan}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{selectedAgency?.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Users</p>
              <p className="text-sm text-muted-foreground">{selectedAgency?.userCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {selectedAgency?.createdAt && new Date(selectedAgency.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
