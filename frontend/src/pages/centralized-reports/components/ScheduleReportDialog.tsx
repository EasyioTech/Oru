import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  day: string;
  time: string;
}

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ScheduleConfig;
  onConfigChange: (config: ScheduleConfig) => void;
  onSchedule: () => void;
}

export const ScheduleReportDialog = ({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onSchedule
}: ScheduleReportDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogDescription>Configure automatic report generation schedule</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Frequency</Label>
          <Select
            value={config.frequency}
            onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
              onConfigChange({ ...config, frequency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {config.frequency === 'monthly' && (
          <div>
            <Label>Day of Month</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={config.day}
              onChange={(e) => onConfigChange({ ...config, day: e.target.value })}
            />
          </div>
        )}
        <div>
          <Label>Time</Label>
          <Input
            type="time"
            value={config.time}
            onChange={(e) => onConfigChange({ ...config, time: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onSchedule}>Schedule Report</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
