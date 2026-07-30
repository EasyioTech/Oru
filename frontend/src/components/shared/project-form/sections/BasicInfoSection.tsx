import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Project } from '../types';

interface BasicInfoSectionProps {
  formData: Project;
  setFormData: React.Dispatch<React.SetStateAction<Project>>;
}

export function BasicInfoSection({ formData, setFormData }: BasicInfoSectionProps) {
  const set = (patch: Partial<Project>) => setFormData(p => ({ ...p, ...patch }));
  return (
    <div className="space-y-4 border-b pb-4">
      <h3 className="font-semibold text-sm">Basic Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input id="name" value={formData.name} onChange={e => set({ name: e.target.value })} required placeholder="Enter project name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project_code">Project Code</Label>
          <Input id="project_code" value={formData.project_code || ''} onChange={e => set({ project_code: e.target.value || null })} placeholder="Auto-generated if empty" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project_type">Project Type</Label>
          <Input id="project_type" value={formData.project_type || ''} onChange={e => set({ project_type: e.target.value || null })} placeholder="e.g., Web Development, Marketing" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => set({ status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['planning','active','in-progress','on-hold','completed','cancelled'].map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority || 'medium'} onValueChange={(v: any) => set({ priority: v as Project['priority'] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['low','medium','high','critical'].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="progress">Progress (%)</Label>
          <Input id="progress" type="number" min="0" max="100" value={formData.progress} onChange={e => set({ progress: Number(e.target.value) })} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description || ''} onChange={e => set({ description: e.target.value })} rows={3} placeholder="Enter project description" />
      </div>
    </div>
  );
}
