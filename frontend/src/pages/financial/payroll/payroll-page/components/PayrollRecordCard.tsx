import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Edit, Trash2 } from 'lucide-react';
import { getStatusColor } from '../payrollUtils';
import type { PayrollRecord } from '../types';

interface PayrollRecordCardProps {
  record: PayrollRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (record: PayrollRecord) => void;
  onDelete: (record: PayrollRecord) => void;
  onDownloadPaySlip: (record: PayrollRecord) => void;
}

export function PayrollRecordCard({ record, selected, onSelect, onEdit, onDelete, onDownloadPaySlip }: PayrollRecordCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Checkbox checked={selected} onCheckedChange={() => onSelect(record.id)} className="mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold">{record.employee}</h3>
            <p className="text-sm text-muted-foreground">{record.position}</p>
            <p className="text-xs text-muted-foreground">{record.payPeriod}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(record.status)}>{record.status}</Badge>
          <Button size="sm" variant="outline" onClick={() => onEdit(record)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(record)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Base Salary</p>
          <p className="font-medium">₹{record.baseSalary.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Overtime</p>
          <p className="font-medium text-green-600">+₹{record.overtime}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Deductions</p>
          <p className="font-medium text-red-600">-₹{record.deductions}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Net Pay</p>
          <p className="font-bold text-lg">₹{record.netPay.toLocaleString()}</p>
        </div>
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onDownloadPaySlip(record)}>
            <Download className="mr-1 h-3 w-3" />Pay Slip
          </Button>
        </div>
      </div>
    </div>
  );
}
