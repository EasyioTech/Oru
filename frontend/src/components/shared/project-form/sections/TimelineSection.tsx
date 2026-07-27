import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { type Project } from '../types';

interface TimelineSectionProps {
  formData: Project;
  setFormData: React.Dispatch<React.SetStateAction<Project>>;
}

export function TimelineSection({ formData, setFormData }: TimelineSectionProps) {
  const { toast } = useToast();
  const setDate = (field: 'start_date' | 'end_date' | 'deadline', value: string | null, label: string) => {
    if (value && value < '2000-01-01') {
      toast({ title: 'Invalid Date', description: `${label} cannot be before year 2000`, variant: 'destructive' });
      return;
    }
    if (value && field !== 'start_date' && formData.start_date && value < formData.start_date) {
      toast({ title: 'Invalid Date', description: `${label} must be after start date`, variant: 'destructive' });
      return;
    }
    setFormData(p => ({ ...p, [field]: value }));
  };
  return (
    <div className="space-y-4 border-b pb-4">
      <h3 className="font-semibold text-sm">Timeline & Dates</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input id="start_date" type="date" min="2000-01-01" max="2100-12-31"
            value={formData.start_date || ''}
            onChange={e => setDate('start_date', e.target.value || null, 'Start date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input id="end_date" type="date" min={formData.start_date || '2000-01-01'} max="2100-12-31"
            value={formData.end_date || ''}
            onChange={e => setDate('end_date', e.target.value || null, 'End date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="date" min={formData.start_date || '2000-01-01'} max="2100-12-31"
            value={formData.deadline || ''}
            onChange={e => setDate('deadline', e.target.value || null, 'Deadline')} />
        </div>
      </div>
    </div>
  );
}
