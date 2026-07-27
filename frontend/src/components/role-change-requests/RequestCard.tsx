import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertTriangle, Eye, Trash2, Loader2 } from 'lucide-react';
import { ROLE_DISPLAY_NAMES } from '@/utils/roleUtils';
import type { RoleChangeRequest, ActionType } from './types';

const STATUS_ICONS: Record<string, JSX.Element | null> = {
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  approved: <CheckCircle className="h-4 w-4 text-green-600" />,
  rejected: <XCircle className="h-4 w-4 text-red-600" />,
  expired: <AlertTriangle className="h-4 w-4 text-gray-600" />,
};

function StatusBadge({ status }: { status: string }) {
  const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
  return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
}

interface Props {
  request: RoleChangeRequest;
  canManageRoleChanges: boolean | string | null;
  canCancelRequest: (r: RoleChangeRequest) => boolean;
  processing: boolean;
  actionRequestId: string | null;
  actionType: ActionType | null;
  onViewDetails: (r: RoleChangeRequest) => void;
  onAction: (id: string, type: ActionType) => void;
}

export function RequestCard({ request, canManageRoleChanges, canCancelRequest, processing, actionRequestId, actionType, onViewDetails, onAction }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {STATUS_ICONS[request.status]}
            <CardTitle className="text-lg">{request.profile?.full_name || 'Unknown User'}</CardTitle>
            <StatusBadge status={request.status} />
          </div>
          <div className="text-sm text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</div>
        </div>
        <CardDescription>
          Requested by: {request.requested_by_profile?.full_name || 'Unknown'}
          {request.reviewed_by && request.reviewed_at && <> • Reviewed on {new Date(request.reviewed_at).toLocaleDateString()}</>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Current Role</h4>
            <Badge variant="outline">{request.previous_role ? (ROLE_DISPLAY_NAMES[request.previous_role] || request.previous_role) : 'No role assigned'}</Badge>
          </div>
          <div>
            <h4 className="font-medium">Requested Role</h4>
            <Badge variant="default">{ROLE_DISPLAY_NAMES[request.requested_role] || request.requested_role}</Badge>
          </div>
        </div>
        {request.reason && (
          <div><h4 className="font-medium">Reason</h4><p className="text-sm text-muted-foreground">{request.reason}</p></div>
        )}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails(request)}>
              <Eye className="h-4 w-4 mr-1" />View Details
            </Button>
            {canCancelRequest(request) && (
              <Button size="sm" variant="outline" onClick={() => onAction(request.id, 'delete')} disabled={processing}>
                <Trash2 className="h-4 w-4 mr-1" />Cancel Request
              </Button>
            )}
          </div>
          {canManageRoleChanges && request.status === 'pending' && (
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => onAction(request.id, 'approve')} disabled={processing}>
                {processing && actionRequestId === request.id && actionType === 'approve' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onAction(request.id, 'reject')} disabled={processing}>
                {processing && actionRequestId === request.id && actionType === 'reject' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
