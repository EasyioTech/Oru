import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Project } from '../types';

interface BudgetSectionProps {
  formData: Project;
  setFormData: React.Dispatch<React.SetStateAction<Project>>;
  isEditing: boolean;
}

export function BudgetSection({ formData, setFormData, isEditing }: BudgetSectionProps) {
  const set = (patch: Partial<Project>) => setFormData(p => ({ ...p, ...patch }));
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg text-foreground">Budget & Financial</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Currency</Label>
          <Select value={formData.currency || 'INR'} onValueChange={v => set({ currency: v })}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="budget" className="text-sm font-medium">Total Budget</Label>
          <Input id="budget" type="number" min="0" step="0.01" value={formData.budget || ''} onChange={e => set({ budget: e.target.value ? Number(e.target.value) : null })} placeholder="0.00" className="h-11" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="allocated_budget" className="text-sm font-medium">Allocated Budget</Label>
          <Input id="allocated_budget" type="number" min="0" step="0.01" value={formData.allocated_budget || ''} onChange={e => set({ allocated_budget: e.target.value ? Number(e.target.value) : null })} placeholder="0.00" className="h-11" />
          {formData.allocated_budget && formData.budget && formData.allocated_budget > formData.budget && (
            <p className="text-xs text-destructive">Allocated budget cannot exceed total budget</p>
          )}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="cost_center" className="text-sm font-medium">Cost Center</Label>
          <Input id="cost_center" value={formData.cost_center || ''} onChange={e => set({ cost_center: e.target.value || null })} placeholder="e.g., Engineering, Marketing" className="h-11" />
        </div>
      </div>
      {isEditing && (
        <div className="space-y-2.5">
          <Label htmlFor="actual_cost" className="text-sm font-medium">Actual Cost</Label>
          <Input id="actual_cost" type="number" min="0" step="0.01" value={formData.actual_cost || 0} onChange={e => set({ actual_cost: Number(e.target.value) })} placeholder="0.00" className="h-11 max-w-[calc(50%-12px)]" />
        </div>
      )}
    </div>
  );
}
