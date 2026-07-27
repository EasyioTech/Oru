import { useState } from 'react';
import { useDepartments, Department } from '@/hooks/useDepartments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus, Building2, CheckCircle2 } from 'lucide-react';

export default function DepartmentManagement() {
  const { departments, stats, isLoading, createDept, updateDept, deleteDept } = useDepartments();
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setEditing({} as Department);
  };

  const handleSave = () => {
    if (editing?.id) updateDept.mutate({ id: editing.id, data: form });
    else createDept.mutate(form);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────── */}
      <PageHeader
        title="Departments"
        description="Manage your organisation's department structure"
        actions={
          <Button size="sm" onClick={openCreate} className="gap-1.5 h-8 text-xs sm:text-sm sm:h-9">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Department</span>
          </Button>
        }
      />

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl sm:text-2xl font-bold leading-tight">{stats?.total ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl sm:text-2xl font-bold leading-tight">{stats?.active ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0 sm:pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              Loading departments…
            </div>
          ) : departments?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No departments yet</p>
              <Button size="sm" variant="outline" onClick={openCreate} className="mt-1 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add your first department
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments?.map((d: Department) => (
                  <TableRow key={d.id}>
                    <TableCell className="pl-4 font-medium text-sm">{d.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {d.description || '—'}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => { setForm({ name: d.name, description: d.description || '' }); setEditing(d); }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => deleteDept.mutate(d.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Create / Edit dialog ─────────────────────────────── */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit' : 'Create'} Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              placeholder="Department name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
