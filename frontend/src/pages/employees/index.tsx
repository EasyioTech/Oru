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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';

const COLORS = {
  lime: '#D8F5A1', limeText: '#6D7F2A',
  teal: '#6DB8D8', tealText: '#1B4D5C',
  heather: '#CEBBEE', heatherText: '#4A3B5C',
  pink: '#F8A9DD', pinkText: '#6B2851',
  sky: '#74D1FF', skyText: '#0D47A1',
};

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
        <Link to={`/employees/${row.original.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
          {row.original.first_name} {row.original.last_name}
        </Link>
      ),
    },
    { accessorKey: 'position', header: 'Role' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Team Engagement</h1>
        <p className="text-gray-600">Monitor and manage your workforce</p>
      </div>

      {/* KPI Cards with Color Palette */}
      {!isLoading && employees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.lime }}>
            <p className="text-xs font-semibold" style={{ color: COLORS.limeText }}>Total Team</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.limeText }}>{totalEmployees}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.teal }}>
            <p className="text-xs font-semibold" style={{ color: COLORS.tealText }}>Active Now</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.tealText }}>{activeEmployees}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.pink }}>
            <p className="text-xs font-semibold" style={{ color: COLORS.pinkText }}>On Leave</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.pinkText }}>{onLeaveEmployees}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: COLORS.sky }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold" style={{ color: COLORS.skyText }}>Engagement</p>
                <p className="text-3xl font-bold" style={{ color: COLORS.skyText }}>{engagementScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: COLORS.skyText }} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name or role..." className="pl-9 border-gray-300" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40 border-gray-300">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => navigate('/create-employee')}>
          <Plus className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Loading team...</p>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <DataTable columns={columns} data={filteredEmployees} />
        </div>
      ) : (
        <div className="h-56 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Users className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-900 font-medium">No team members</p>
          <p className="text-gray-500 text-sm mt-1">Add your first team member to get started</p>
        </div>
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
