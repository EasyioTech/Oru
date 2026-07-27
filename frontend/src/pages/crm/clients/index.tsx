import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { ColumnDef } from '@tanstack/react-table';
import { useClients, Client } from '@/hooks/useClients';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ClientFormDialog from '@/components/shared/ClientFormDialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';

export default function ClientsPage() {
  const { clients, isLoading, deleteClient } = useClients();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || c.status === status;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<Client>[] = [
    { accessorKey: 'clientNumber', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'companyName', header: 'Company' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedClient(row.original); setIsFormOpen(true); }}>
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage client relationships and details.</p>
        </div>
        <Button onClick={() => { setSelectedClient(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? <p>Loading...</p> : <DataTable columns={columns} data={filteredClients} />}

      <ClientFormDialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedClient(null); }}
        client={selectedClient}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => { deleteClient.mutate(deleteId!); setDeleteId(null); }}
        itemType="Client"
        itemName={clients.find(c => c.id === deleteId)?.name || ''}
      />
    </div>
  );
}