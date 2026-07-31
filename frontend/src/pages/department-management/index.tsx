import { useState, useMemo } from 'react';
import { useDepartments, Department } from '@/hooks/useDepartments';
import { FloatingCard, DisplayTitle, MicroLabel, PillButton } from '@/components/ui/design-tokens';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Building2,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Building,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DepartmentManagement() {
  const { departments, stats, isLoading, createDept, updateDept, deleteDept } = useDepartments();
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });
  const [searchQuery, setSearchQuery] = useState('');

  const openCreate = () => {
    setForm({ name: '', description: '', is_active: true });
    setEditing({} as Department);
  };

  const handleSave = () => {
    if (editing?.id) updateDept.mutate({ id: editing.id, data: form });
    else createDept.mutate(form);
    setEditing(null);
  };

  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    if (!searchQuery) return departments;
    const lowerQuery = searchQuery.toLowerCase();
    return departments.filter(d => 
      d.name.toLowerCase().includes(lowerQuery) || 
      (d.description && d.description.toLowerCase().includes(lowerQuery))
    );
  }, [departments, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* ── Hero header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <DisplayTitle>Departments</DisplayTitle>
          <MicroLabel className="text-gray-500">Manage your organisation's department structure</MicroLabel>
        </div>
        <PillButton onClick={openCreate} icon={Plus} label="Add Department" />
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FloatingCard className="p-6 flex items-center gap-5" delay={0.1}>
          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <MicroLabel className="text-gray-500 mb-1">Total Departments</MicroLabel>
            <p className="text-3xl font-semibold text-gray-900 tracking-tight">
              {stats?.total ?? 0}
            </p>
          </div>
        </FloatingCard>

        <FloatingCard className="p-6 flex items-center gap-5" delay={0.2}>
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <MicroLabel className="text-gray-500 mb-1">Active</MicroLabel>
            <p className="text-3xl font-semibold text-gray-900 tracking-tight">
              {stats?.active ?? 0}
            </p>
          </div>
        </FloatingCard>
        
        <FloatingCard className="p-6 flex items-center gap-5" delay={0.3}>
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Activity className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <MicroLabel className="text-gray-500 mb-1">Inactive</MicroLabel>
            <p className="text-3xl font-semibold text-gray-900 tracking-tight">
              {(stats?.total ?? 0) - (stats?.active ?? 0)}
            </p>
          </div>
        </FloatingCard>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <FloatingCard className="p-0 overflow-hidden" delay={0.4}>
        <div className="p-6 border-b border-gray-100/50 bg-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Department Directory</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage all active and inactive departments.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search departments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/60 border-gray-200/60 shadow-sm h-10 w-full rounded-xl focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
              <p className="text-sm font-medium">Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-300" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">No departments found</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  {searchQuery ? "We couldn't find any departments matching your search query." : "You haven't added any departments yet. Start by creating one."}
                </p>
              </div>
              {!searchQuery && (
                <PillButton onClick={openCreate} icon={Plus} label="Add your first department" className="mt-2" />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="pl-6 w-[35%] text-xs font-semibold uppercase tracking-wider text-gray-500 h-12">Department Info</TableHead>
                  <TableHead className="w-[45%] text-xs font-semibold uppercase tracking-wider text-gray-500 h-12">Description</TableHead>
                  <TableHead className="w-[10%] text-xs font-semibold uppercase tracking-wider text-gray-500 h-12">Status</TableHead>
                  <TableHead className="text-right pr-6 w-[10%] text-xs font-semibold uppercase tracking-wider text-gray-500 h-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((d: Department) => (
                  <TableRow key={d.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100/50">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gray-100/80 flex items-center justify-center flex-shrink-0 text-gray-600 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                          <Building className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{d.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">ID: {d.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {d.description || <span className="italic opacity-50">No description provided</span>}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant="outline"
                        className={cn(
                          "font-medium border-0 px-2.5 py-1 rounded-full text-xs", 
                          d.is_active !== false 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {d.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-gray-100 p-1">
                          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider py-2">Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => { 
                              setForm({ name: d.name, description: d.description || '', is_active: d.is_active !== false }); 
                              setEditing(d); 
                            }}
                            className="cursor-pointer rounded-lg text-sm text-gray-700 py-2 focus:bg-gray-50"
                          >
                            <Pencil className="mr-2 h-4 w-4 text-gray-400" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteDept.mutate(d.id)}
                            className="cursor-pointer rounded-lg text-sm text-red-600 py-2 focus:bg-red-50 focus:text-red-700 mt-1"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </FloatingCard>

      {/* ── Create / Edit dialog ─────────────────────────────── */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border-gray-100 shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-medium tracking-tight flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Building className="h-4 w-4 text-black" />
              </div>
              {editing?.id ? 'Edit Department' : 'Create Department'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-gray-500">Department Name</Label>
              <Input
                id="name"
                placeholder="e.g. Engineering, Human Resources..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-black focus-visible:border-black transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</Label>
              <Input
                id="description"
                placeholder="Briefly describe the department's role..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-black focus-visible:border-black transition-all"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 bg-gray-50/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-gray-900">Active Status</Label>
                <p className="text-xs text-gray-500">
                  Inactive departments are hidden from selections.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={checked => setForm({ ...form, is_active: checked })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-full h-11 border-gray-200 hover:bg-gray-50 text-gray-600 font-medium" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2 rounded-full h-11 bg-black text-white hover:bg-gray-800 font-medium" onClick={handleSave} disabled={!form.name.trim()}>
                {editing?.id ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Department
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
