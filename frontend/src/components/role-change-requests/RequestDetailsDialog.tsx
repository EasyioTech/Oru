import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROLE_DISPLAY_NAMES } from '@/utils/roleUtils';
import type { RoleChangeRequest } from './types';

interface Props {
  open: boolean;
  request: RoleChangeRequest | null;
  onClose: () => void;
}

export function RequestDetailsDialog({ open, request, onClose }: Props) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Role Change Request Details</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Employee</p>
              <p>{request.profile?.full_name || 'Unknown'}</p>
              {request.profile?.email && <p className="text-muted-foreground text-xs">{request.profile.email}</p>}
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Status</p>
              <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}>
                {request.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Current Role</p>
              <Badge variant="outline">{request.previous_role ? (ROLE_DISPLAY_NAMES[request.previous_role] || request.previous_role) : 'No role assigned'}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Requested Role</p>
              <Badge>{ROLE_DISPLAY_NAMES[request.requested_role] || request.requested_role}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Requested By</p>
              <p>{request.requested_by_profile?.full_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Created At</p>
              <p>{new Date(request.created_at).toLocaleString()}</p>
            </div>
            {request.reviewed_by_profile && (
              <div>
                <p className="text-muted-foreground font-medium">Reviewed By</p>
                <p>{request.reviewed_by_profile.full_name}</p>
              </div>
            )}
            {request.reviewed_at && (
              <div>
                <p className="text-muted-foreground font-medium">Reviewed At</p>
                <p>{new Date(request.reviewed_at).toLocaleString()}</p>
              </div>
            )}
          </div>
          {request.reason && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground font-medium text-sm mb-1">Reason</p>
              <p className="text-sm">{request.reason}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
