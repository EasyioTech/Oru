import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronsUpDown, CalendarIcon, Briefcase, User, Flag, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchJson } from '@/utils/authApi';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  project_id: z.string().optional().or(z.literal('')),
  assignee_id: z.string().optional().or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'urgent']).default('medium'),
  due_date: z.string().optional().or(z.literal('')),
  estimated_hours: z.number().optional().or(z.literal('')),
});
type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskFormDialog({ task, onTaskSaved, trigger, projectId, open, onOpenChange }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: async () => await fetchJson('/projects') || [] });
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: async () => await fetchJson('/hr/employees') || [] });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', status: 'todo', priority: 'medium', project_id: projectId || '' }
  });

  useEffect(() => {
    if (task) reset({ ...task, project_id: task.project_id || projectId || '', assignee_id: task.assignee_id || '', estimated_hours: task.estimated_hours || '' });
    else reset({ title: '', description: '', status: 'todo', priority: 'medium', project_id: projectId || '' });
  }, [task, projectId, reset, open]);

  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const url = task ? `/api/projects/tasks/${task.id}` : (data.project_id ? `/api/projects/${data.project_id}/tasks` : `/api/tasks`);
      const res = await fetch(url, {
        method: task ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Success', description: 'Task saved successfully' });
      onTaskSaved?.();
      onOpenChange?.(false);
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <div onClick={() => onOpenChange?.(true)}>{trigger}</div>}
      <DialogContent>
        <DialogHeader><DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2"><Label>Title *</Label><Input {...register('title')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <select {...register('project_id')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                <option value="">None</option>
                {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <select {...register('assignee_id')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                <option value="">Unassigned</option>
                {employees.map((e: any) => <option key={e.id} value={e.user_id || e.id}>{e.full_name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                {['todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select {...register('priority')} className="flex h-10 w-full rounded-md border border-zinc-200 px-3">
                {['low', 'medium', 'high', 'critical', 'urgent'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Due Date</Label><Input type="date" {...register('due_date')} /></div>
            <div className="space-y-2"><Label>Est. Hours</Label><Input type="number" step="0.5" {...register('estimated_hours', { valueAsNumber: true })} /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
