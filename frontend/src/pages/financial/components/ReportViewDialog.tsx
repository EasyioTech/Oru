import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportViewData: { title: string; data: unknown } | null;
  onNavigateReports: () => void;
}

export function ReportViewDialog({ open, onOpenChange, reportViewData, onNavigateReports }: Props) {
  const handleDownload = () => {
    if (!reportViewData) return;
    const blob = new Blob([JSON.stringify(reportViewData.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportViewData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reportViewData?.title || 'Financial Report'}</DialogTitle>
          <DialogDescription>Generated on: {new Date().toLocaleString()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {reportViewData?.data && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(reportViewData.data, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />Export JSON
                </Button>
                <Button variant="outline" onClick={onNavigateReports}>
                  <FileText className="h-4 w-4 mr-2" />Go to Reports
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
