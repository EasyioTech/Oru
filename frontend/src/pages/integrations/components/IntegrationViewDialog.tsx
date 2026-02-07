import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { Integration } from '@/services/api/integrations';

interface IntegrationViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: Integration | null;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const IntegrationViewDialog = ({
  open,
  onOpenChange,
  integration,
  getStatusBadge,
}: IntegrationViewDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Integration Details</DialogTitle>
        <DialogDescription>View integration information</DialogDescription>
      </DialogHeader>
      {integration && (
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{integration.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p>{integration.integration_type}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Provider</Label>
              <p>{integration.provider || '-'}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">{getStatusBadge(integration.status)}</div>
          </div>
          {integration.description && (
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p>{integration.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Last Sync</Label>
              <p>
                {integration.last_sync_at
                  ? new Date(integration.last_sync_at).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sync Status</Label>
              <p>{integration.last_sync_status || '-'}</p>
            </div>
          </div>
          {integration.error_count !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Success Count</Label>
                <p>{integration.success_count || 0}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Error Count</Label>
                <p>{integration.error_count || 0}</p>
              </div>
            </div>
          )}
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
