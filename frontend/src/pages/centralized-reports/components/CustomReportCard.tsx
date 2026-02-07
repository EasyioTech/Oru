import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, FileText, Trash2 } from 'lucide-react';
import type { CustomReport } from '@/services/api/reports';

interface CustomReportCardProps {
  report: CustomReport;
  onEdit: () => void;
  onDelete: () => void;
}

export const CustomReportCard = ({ report, onEdit, onDelete }: CustomReportCardProps) => (
  <Card className="group cursor-pointer hover:shadow-lg border hover:border-orange-200 dark:hover:border-orange-800 flex flex-col h-full overflow-hidden">
    <CardHeader className="pb-3 space-y-2 flex-shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <CardTitle className="text-sm sm:text-base font-semibold leading-tight mb-1 line-clamp-2 break-words">
              {report.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground line-clamp-2 break-words">
              {report.description || 'Custom report'}
            </p>
          </div>
        </div>
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 flex-shrink-0 text-xs px-1.5 py-0.5 whitespace-nowrap" variant="secondary">
          Custom
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="pt-0 pb-3 flex-1 flex flex-col justify-end overflow-hidden">
      <div className="space-y-2.5 w-full">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Created: <span className="font-medium text-foreground">{new Date(report.created_at).toLocaleDateString()}</span></span>
        </div>
        <div className="flex gap-2 w-full">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={onEdit}>
            <Edit className="h-3 w-3 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="text-xs h-8 px-2">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
