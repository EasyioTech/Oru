import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Trash2, Users, TrendingUp } from 'lucide-react';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { DisplayTitle, MicroLabel, FloatingCard } from '@/components/ui/design-tokens';
import { EmployeeMetrics } from './components/EmployeeMetrics';
import { EmployeeFilters } from './components/EmployeeFilters';

export default function EmployeesPage() {
  const { employees, isLoading, deleteEmployee } = useEmployees();
  const navigate = useNavigate();
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [status, setStatus] = useQueryState('status', { defaultValue: 'all' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredEmployees = employees.filter((e) => {
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || e.status === status;
    return matchesSearch && matchesStatus;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;
  const onLeaveEmployees = employees.filter((e) => e.status === 'on_leave').length;
  const engagementScore = Math.round((activeEmployees / (totalEmployees || 1)) * 100);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Team Member',
      cell: ({ row }) => (
        <Link to={`/employees/${row.original.id}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600">
          {row.original.first_name} {row.original.last_name}
        </Link>
      ),
    },
    { accessorKey: 'position', header: 'Role' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'}>
          {row.original.status?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/employees/${row.original.id}`)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="space-y-1 mb-8">
        <DisplayTitle>Team Engagement</DisplayTitle>
        <MicroLabel className="text-gray-500">Monitor and manage your workforce</MicroLabel>
      </div>

      {/* KPI Cards */}
      {!isLoading && employees.length > 0 && (
        <EmployeeMetrics 
          stats={{
            total: totalEmployees,
            active: activeEmployees,
            onLeave: onLeaveEmployees,
            engagementScore: engagementScore
          }} 
        />
      )}

      {/* Filters */}
      <EmployeeFilters
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={status}
        onStatusFilterChange={setStatus}
        onAddMember={() => navigate('/create-employee')}
      />

      {/* Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse font-medium">Loading team...</p>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <FloatingCard className="overflow-hidden bg-white/60">
          <DataTable columns={columns} data={filteredEmployees} />
        </FloatingCard>
      ) : (
        <FloatingCard className="h-56 flex flex-col items-center justify-center bg-white/40 border-dashed border-gray-200">
          <Users className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium text-lg">No team members found</p>
          <p className="text-gray-500 text-sm mt-1">Adjust your filters or add a new team member to get started.</p>
        </FloatingCard>
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onDeleted={() => { deleteEmployee.mutate(deleteId!); setDeleteId(null); }}
        itemType="Employee"
        itemName="Employee"
      />
    </div>
  );
}
