import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateCustomReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  reportType: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onReportTypeChange: (value: string) => void;
  onSubmit: () => void;
}

export const CreateCustomReportDialog = ({
  open,
  onOpenChange,
  name,
  description,
  reportType,
  onNameChange,
  onDescriptionChange,
  onReportTypeChange,
  onSubmit
}: CreateCustomReportDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Custom Report</DialogTitle>
        <DialogDescription>Create a new custom report template</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Report Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter report name"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter report description"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="type">Report Type</Label>
          <Select value={reportType} onValueChange={onReportTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onSubmit}>Create Report</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
