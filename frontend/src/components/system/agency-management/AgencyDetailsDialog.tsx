import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings, Loader2 } from 'lucide-react';
import type { AgencyDetails } from '@/services/api/agencies';
import { formatDate, getPlanColor } from './utils';

interface Props {
  open: boolean;
  onClose: () => void;
  agency: AgencyDetails | null;
  isLoading: boolean;
  onEditClick: () => void;
}

export function AgencyDetailsDialog({ open, onClose, agency, isLoading, onEditClick }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Agency Details</DialogTitle>
          <DialogDescription>Complete information about this agency</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : agency ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <div><Label className="text-muted-foreground">Agency Name</Label><p className="font-medium">{agency.name}</p></div>
            <div><Label className="text-muted-foreground">Domain</Label><p className="font-medium">{agency.domain || 'Not set'}</p></div>
            <div>
              <Label className="text-muted-foreground">Subscription Plan</Label>
              <Badge className={`capitalize ${getPlanColor(agency.subscription_plan)}`}>{agency.subscription_plan}</Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <Badge variant={agency.is_active ? 'default' : 'secondary'}>{agency.is_active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div><Label className="text-muted-foreground">Users</Label><p className="font-medium">{agency.user_count} / {agency.max_users || '∞'}</p></div>
            <div><Label className="text-muted-foreground">Projects</Label><p className="font-medium">{agency.project_count}</p></div>
            <div><Label className="text-muted-foreground">Invoices</Label><p className="font-medium">{agency.invoice_count}</p></div>
            <div><Label className="text-muted-foreground">Created</Label><p className="font-medium">{formatDate(agency.created_at)}</p></div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {agency && (
            <Button onClick={onEditClick}><Settings className="mr-2 h-4 w-4" />Edit Agency</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
