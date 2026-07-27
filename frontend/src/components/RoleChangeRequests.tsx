import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useRoleChangeRequests } from './role-change-requests/hooks/useRoleChangeRequests';
import { RequestCard } from './role-change-requests/RequestCard';
import { CreateRequestDialog } from './role-change-requests/CreateRequestDialog';
import { RequestDetailsDialog } from './role-change-requests/RequestDetailsDialog';
import { ApproveConfirmDialog, RejectConfirmDialog, DeleteConfirmDialog } from './role-change-requests/ConfirmDialogs';
import { useAuth } from '@/hooks/useAuth';
import type { StatusFilter } from './role-change-requests/types';
import type { AppRole } from '@/utils/roleUtils';

const STATUS_TABS: StatusFilter[] = ['all', 'pending', 'approved', 'rejected', 'expired'];

export const RoleChangeRequests = () => {
  const { userRole } = useAuth();
  const hook = useRoleChangeRequests();
  const {
    requests, loading, processing, creating, employees,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    newRequest, setNewRequest, selectedRequest, setSelectedRequest,
    showCreateDialog, setShowCreateDialog, showDetailsDialog, setShowDetailsDialog,
    showDeleteConfirm, setShowDeleteConfirm, showApproveConfirm, setShowApproveConfirm,
    showRejectConfirm, setShowRejectConfirm, actionRequestId, actionType,
    canManageRoleChanges, canCreateRequests, canCancelRequest,
    fetchRequests, handleCreateRequest, handleApproveRequest, handleDeleteRequest, handleRequestAction,
  } = hook;

  const filtered = requests.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || r.profile?.full_name?.toLowerCase().includes(term) || r.profile?.email?.toLowerCase().includes(term) || r.requested_role?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const countByStatus = (s: StatusFilter) => s === 'all' ? requests.length : requests.filter(r => r.status === s).length;

  const cardProps = {
    canManageRoleChanges, canCancelRequest, processing, actionRequestId, actionType,
    onViewDetails: (r: typeof requests[0]) => { setSelectedRequest(r); setShowDetailsDialog(true); },
    onAction: handleRequestAction,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Role Change Requests</h1>
          <p className="text-muted-foreground">Manage and track role change requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          {canCreateRequests && (
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />Create Request
            </Button>
          )}
        </div>
      </div>

      <Input placeholder="Search by name, email, or role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />

      <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          {STATUS_TABS.map(s => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s} <Badge variant="secondary" className="ml-1">{countByStatus(s)}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUS_TABS.map(s => (
          <TabsContent key={s} value={s} className="space-y-4 mt-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No {s === 'all' ? '' : s} requests found</div>
            ) : (
              filtered.map(r => <RequestCard key={r.id} request={r} {...cardProps} />)
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CreateRequestDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        form={newRequest}
        onChange={setNewRequest}
        employees={employees as Array<{ user_id: string; full_name: string; email: string }>}
        creating={creating}
        userRole={userRole as AppRole}
        onSubmit={handleCreateRequest}
      />

      <RequestDetailsDialog
        open={showDetailsDialog}
        request={selectedRequest}
        onClose={() => setShowDetailsDialog(false)}
      />

      <ApproveConfirmDialog
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => actionRequestId && handleApproveRequest(actionRequestId, 'approved')}
        processing={processing}
      />

      <RejectConfirmDialog
        open={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={() => actionRequestId && handleApproveRequest(actionRequestId, 'rejected')}
        processing={processing}
      />

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => actionRequestId && handleDeleteRequest(actionRequestId)}
        processing={processing}
      />
    </div>
  );
};

export default RoleChangeRequests;
