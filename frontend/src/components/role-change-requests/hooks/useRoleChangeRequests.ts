import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AppRole } from '@/utils/roleUtils';
import { selectRecords, insertRecord, updateRecord, deleteRecord } from '@/services/api/core';
import { generateUUID } from '@/lib/uuid';
import type { RoleChangeRequest, NewRequestForm, StatusFilter, ActionType } from '../types';

const DEFAULT_FORM: NewRequestForm = { user_id: '', requested_role: '', reason: '' };

export function useRoleChangeRequests() {
  const { userRole, user } = useAuth();
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [newRequest, setNewRequest] = useState<NewRequestForm>(DEFAULT_FORM);
  const [selectedRequest, setSelectedRequest] = useState<RoleChangeRequest | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  const canManageRoleChanges = userRole && ['super_admin', 'agency_admin'].includes(userRole);
  const canCreateRequests = userRole && ['agency_admin', 'manager'].includes(userRole);

  const fetchRequests = async () => {
    try {
      const data = await selectRecords<RoleChangeRequest>('role_change_requests', { orderBy: 'created_at DESC' });
      if (!data || data.length === 0) { setRequests([]); setLoading(false); return; }

      const userIds = new Set<string>();
      data.forEach(r => { if (r.user_id) userIds.add(r.user_id); if (r.requested_by) userIds.add(r.requested_by); if (r.reviewed_by) userIds.add(r.reviewed_by); });

      const profileMap = new Map<string, { full_name: string; email: string }>();
      if (userIds.size > 0) {
        const idArray = Array.from(userIds);
        const [profiles, users] = await Promise.all([
          selectRecords<{ user_id: string; full_name: string }>('profiles', { filters: [{ column: 'user_id', operator: 'in', value: idArray }] }),
          selectRecords<{ id: string; email: string }>('users', { filters: [{ column: 'id', operator: 'in', value: idArray }] }),
        ]);
        profiles.forEach(p => { const u = users.find(u => u.id === p.user_id); profileMap.set(p.user_id, { full_name: p.full_name || 'Unknown', email: u?.email || '' }); });
      }

      setRequests(data.map(r => ({ ...r, profile: profileMap.get(r.user_id), requested_by_profile: r.requested_by ? profileMap.get(r.requested_by) : undefined, reviewed_by_profile: r.reviewed_by ? { full_name: profileMap.get(r.reviewed_by)?.full_name || 'Unknown' } : undefined })));
    } catch (error: any) {
      const msg = (error as Error)?.message || String(error);
      if (msg.includes('does not exist') || msg.includes('42P01') || msg.includes('relation')) { setRequests([]); }
      else toast.error('Failed to load role change requests');
    } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const profiles = await selectRecords<{ user_id: string; full_name: string }>('profiles', { where: { is_active: true }, orderBy: 'full_name ASC' });
      if (!profiles?.length) { setEmployees([]); return; }
      const userIds = profiles.map(p => p.user_id).filter(Boolean);
      const users = userIds.length > 0 ? await selectRecords<{ id: string; email: string }>('users', { filters: [{ column: 'id', operator: 'in', value: userIds }] }) : [];
      const emailMap = new Map(users.map(u => [u.id, u.email]));
      setEmployees(profiles.map(p => ({ ...p, email: emailMap.get(p.user_id) || '' })));
    } catch { toast.error('Failed to load employees'); }
  };

  useEffect(() => { fetchRequests(); if (canCreateRequests) fetchEmployees(); }, [canCreateRequests]);

  const handleCreateRequest = async () => {
    if (!user || !newRequest.user_id || !newRequest.requested_role) { toast.error('Please fill in all required fields'); return; }
    setCreating(true);
    try {
      const existingRoles = await selectRecords<{ role: AppRole }>('user_roles', { where: { user_id: newRequest.user_id } });
      const previousRole = existingRoles?.[0]?.role ?? null;
      if (previousRole === newRequest.requested_role) { toast.error('User already has this role'); return; }
      await insertRecord('role_change_requests', { id: generateUUID(), user_id: newRequest.user_id, requested_role: newRequest.requested_role, previous_role: previousRole, reason: newRequest.reason || null, requested_by: user.id, status: 'pending' }, user.id);
      toast.success('Role change request created successfully');
      setShowCreateDialog(false); setNewRequest({ ...DEFAULT_FORM }); fetchRequests();
    } catch (error: any) { toast.error((error as Error)?.message || 'Failed to create role change request'); }
    finally { setCreating(false); }
  };

  const handleApproveRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    if (!user) return;
    setProcessing(true);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) { toast.error('Request not found'); return; }
      await updateRecord('role_change_requests', { status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString() }, { id: requestId }, user.id);
      if (action === 'approved') {
        const existing = await selectRecords<{ id: string; role: AppRole }>('user_roles', { where: { user_id: request.user_id } });
        if (existing?.length > 0) { await updateRecord('user_roles', { role: request.requested_role }, { id: existing[0].id }, user.id); }
        else { await insertRecord('user_roles', { id: generateUUID(), user_id: request.user_id, role: request.requested_role, assigned_by: user.id }, user.id); }
      }
      toast.success(`Request ${action} successfully`);
      setShowApproveConfirm(false); setShowRejectConfirm(false); setActionRequestId(null); setActionType(null); fetchRequests();
    } catch (error: any) { toast.error((error as Error)?.message || `Failed to ${action} request`); }
    finally { setProcessing(false); }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!user) return;
    setProcessing(true);
    try {
      await deleteRecord('role_change_requests', { id: requestId });
      toast.success('Request deleted successfully');
      setShowDeleteConfirm(false); setActionRequestId(null); setActionType(null); fetchRequests();
    } catch (error: any) { toast.error((error as Error)?.message || 'Failed to delete request'); }
    finally { setProcessing(false); }
  };

  const handleRequestAction = (requestId: string, type: ActionType) => {
    setActionRequestId(requestId); setActionType(type);
    if (type === 'approve') setShowApproveConfirm(true);
    else if (type === 'reject') setShowRejectConfirm(true);
    else setShowDeleteConfirm(true);
  };

  const canCancelRequest = (request: RoleChangeRequest) =>
    request.status === 'pending' && request.requested_by === user?.id && !canManageRoleChanges;

  return {
    requests, loading, processing, creating, employees, searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    newRequest, setNewRequest, selectedRequest, setSelectedRequest,
    showCreateDialog, setShowCreateDialog, showDetailsDialog, setShowDetailsDialog,
    showDeleteConfirm, setShowDeleteConfirm, showApproveConfirm, setShowApproveConfirm,
    showRejectConfirm, setShowRejectConfirm, actionRequestId, actionType,
    canManageRoleChanges, canCreateRequests, canCancelRequest,
    fetchRequests, handleCreateRequest, handleApproveRequest, handleDeleteRequest, handleRequestAction,
  };
}
