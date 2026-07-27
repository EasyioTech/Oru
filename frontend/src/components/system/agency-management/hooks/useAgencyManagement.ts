import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AgencySummary as AgencyData } from '@/types/system';
import {
  fetchAgencyDetails,
  updateAgency,
  fetchAgencyUsers,
  fetchAgencyUsage,
  deleteAgency,
  type AgencyDetails,
  type AgencyUser,
  type AgencyUsage,
} from '@/services/api/agencies';

export function useAgencyManagement(agencies: AgencyData[], onRefresh: () => void) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedAgency, setSelectedAgency] = useState<AgencyDetails | null>(null);
  const [agencyUsers, setAgencyUsers] = useState<AgencyUser[]>([]);
  const [agencyUsage, setAgencyUsage] = useState<AgencyUsage | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<AgencyDetails | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AgencyDetails>>({});
  const { toast } = useToast();

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch =
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === 'all' || agency.subscription_plan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  const handleViewDetails = async (agencyId: string) => {
    try {
      setIsLoadingDetails(true);
      const details = await fetchAgencyDetails(agencyId);
      setSelectedAgency(details);
      setEditForm(details);
      setIsDetailsDialogOpen(true);
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to load agency details', variant: 'destructive' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleManageUsers = async (agencyId: string) => {
    try {
      setIsLoadingDetails(true);
      const [users, details] = await Promise.all([fetchAgencyUsers(agencyId), fetchAgencyDetails(agencyId)]);
      setAgencyUsers(users);
      setSelectedAgency(details);
      setIsUsersDialogOpen(true);
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to load agency users', variant: 'destructive' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleViewUsage = async (agencyId: string) => {
    try {
      setIsLoadingDetails(true);
      const [usage, details] = await Promise.all([fetchAgencyUsage(agencyId), fetchAgencyDetails(agencyId)]);
      setAgencyUsage(usage);
      setSelectedAgency(details);
      setIsUsageDialogOpen(true);
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to load agency usage', variant: 'destructive' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleToggleActive = async (agencyId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this agency?`)) return;
    try {
      setIsUpdating(true);
      await updateAgency(agencyId, { is_active: !currentStatus });
      toast({ title: 'Success', description: `Agency ${currentStatus ? 'deactivated' : 'activated'} successfully` });
      onRefresh();
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to update agency status', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEdit = async (agencyId: string) => {
    try {
      const details = await fetchAgencyDetails(agencyId);
      setSelectedAgency(details);
      setEditForm(details);
      setIsEditDialogOpen(true);
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to load agency details', variant: 'destructive' });
    }
  };

  const handleOpenDelete = async (agencyId: string) => {
    try {
      const details = await fetchAgencyDetails(agencyId);
      setAgencyToDelete(details);
      setDeleteConfirmName('');
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to load agency details', variant: 'destructive' });
    }
  };

  const handleEditAgency = async () => {
    if (!selectedAgency) return;
    try {
      setIsUpdating(true);
      await updateAgency(selectedAgency.id, editForm);
      toast({ title: 'Success', description: 'Agency updated successfully' });
      setIsEditDialogOpen(false);
      onRefresh();
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to update agency', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!agencyToDelete || deleteConfirmName.trim() !== agencyToDelete.name) return;
    try {
      setIsDeleting(true);
      await deleteAgency(agencyToDelete.id);
      toast({ title: 'Agency deleted', description: `"${agencyToDelete.name}" and its database have been completely removed.` });
      setAgencyToDelete(null);
      setDeleteConfirmName('');
      onRefresh();
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to delete agency', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditFromDetails = () => {
    if (!selectedAgency) return;
    setIsDetailsDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const closeDelete = () => { setAgencyToDelete(null); setDeleteConfirmName(''); };

  return {
    searchTerm, setSearchTerm, selectedPlan, setSelectedPlan,
    filteredAgencies, selectedAgency, agencyUsers, agencyUsage,
    isDetailsDialogOpen, setIsDetailsDialogOpen,
    isUsersDialogOpen, setIsUsersDialogOpen,
    isUsageDialogOpen, setIsUsageDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    isUpdating, isLoadingDetails,
    agencyToDelete, deleteConfirmName, setDeleteConfirmName, isDeleting,
    editForm, setEditForm,
    handleViewDetails, handleManageUsers, handleViewUsage,
    handleToggleActive, handleOpenEdit, handleOpenDelete,
    handleEditAgency, handleConfirmDelete,
    openEditFromDetails, closeDelete,
  };
}
