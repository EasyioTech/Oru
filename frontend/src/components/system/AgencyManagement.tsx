import type { AgencySummary as AgencyData } from '@/types/system';
import { useAgencyManagement } from './agency-management/hooks/useAgencyManagement';
import { AgencyTable } from './agency-management/AgencyTable';
import { AgencyDetailsDialog } from './agency-management/AgencyDetailsDialog';
import { AgencyUsersDialog } from './agency-management/AgencyUsersDialog';
import { AgencyUsageDialog } from './agency-management/AgencyUsageDialog';
import { AgencyEditDialog } from './agency-management/AgencyEditDialog';
import { AgencyDeleteDialog } from './agency-management/AgencyDeleteDialog';

interface AgencyManagementProps {
  agencies: AgencyData[];
  onRefresh: () => void;
}

export const AgencyManagement = ({ agencies, onRefresh }: AgencyManagementProps) => {
  const h = useAgencyManagement(agencies, onRefresh);

  return (
    <>
      <AgencyTable
        agencies={agencies}
        filteredAgencies={h.filteredAgencies}
        searchTerm={h.searchTerm}
        setSearchTerm={h.setSearchTerm}
        selectedPlan={h.selectedPlan}
        setSelectedPlan={h.setSelectedPlan}
        isUpdating={h.isUpdating}
        onRefresh={onRefresh}
        onViewDetails={h.handleViewDetails}
        onManageUsers={h.handleManageUsers}
        onViewUsage={h.handleViewUsage}
        onOpenEdit={h.handleOpenEdit}
        onToggleActive={h.handleToggleActive}
        onOpenDelete={h.handleOpenDelete}
      />

      <AgencyDetailsDialog
        open={h.isDetailsDialogOpen}
        onClose={() => h.setIsDetailsDialogOpen(false)}
        agency={h.selectedAgency}
        isLoading={h.isLoadingDetails}
        onEditClick={h.openEditFromDetails}
      />

      <AgencyUsersDialog
        open={h.isUsersDialogOpen}
        onClose={() => h.setIsUsersDialogOpen(false)}
        agency={h.selectedAgency}
        users={h.agencyUsers}
        isLoading={h.isLoadingDetails}
      />

      <AgencyUsageDialog
        open={h.isUsageDialogOpen}
        onClose={() => h.setIsUsageDialogOpen(false)}
        agency={h.selectedAgency}
        usage={h.agencyUsage}
        isLoading={h.isLoadingDetails}
      />

      <AgencyEditDialog
        open={h.isEditDialogOpen}
        onClose={() => h.setIsEditDialogOpen(false)}
        agency={h.selectedAgency}
        form={h.editForm}
        onChange={h.setEditForm}
        isUpdating={h.isUpdating}
        onSubmit={h.handleEditAgency}
      />

      <AgencyDeleteDialog
        agency={h.agencyToDelete}
        confirmName={h.deleteConfirmName}
        setConfirmName={h.setDeleteConfirmName}
        isDeleting={h.isDeleting}
        onClose={h.closeDelete}
        onConfirm={h.handleConfirmDelete}
      />
    </>
  );
};
