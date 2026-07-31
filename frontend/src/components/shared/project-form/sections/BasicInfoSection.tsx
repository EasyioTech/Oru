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
    <div className="space-y-6">
      <h3 className="font-semibold text-lg text-foreground">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-sm font-medium">Project Name *</Label>
          <Input id="name" value={formData.name} onChange={e => set({ name: e.target.value })} required placeholder="Enter project name" className="h-11" />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="project_code" className="text-sm font-medium">Project Code</Label>
          <Input id="project_code" value={formData.project_code || ''} onChange={e => set({ project_code: e.target.value || null })} placeholder="Auto-generated if empty" className="h-11" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="project_type" className="text-sm font-medium">Project Type</Label>
          <Input id="project_type" value={formData.project_type || ''} onChange={e => set({ project_type: e.target.value || null })} placeholder="e.g., Web Development, Marketing" className="h-11" />
        </div>
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Status</Label>
          <Select value={formData.status} onValueChange={v => set({ status: v })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['planning','active','in-progress','on-hold','completed','cancelled'].map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Priority</Label>
          <Select value={formData.priority || 'medium'} onValueChange={(v: any) => set({ priority: v as Project['priority'] })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['low','medium','high','critical'].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="progress" className="text-sm font-medium">Progress (%)</Label>
          <Input id="progress" type="number" min="0" max="100" value={formData.progress} onChange={e => set({ progress: Number(e.target.value) })} required className="h-11" />
        </div>
      </div>
      <div className="space-y-2.5">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea id="description" value={formData.description || ''} onChange={e => set({ description: e.target.value })} rows={4} placeholder="Enter detailed project description" className="resize-none" />
      </div>
    </div>
  );
}
