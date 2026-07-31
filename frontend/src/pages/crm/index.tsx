/**
 * CRM Page
 * Customer Relationship Management interface
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FloatingCard, PillButton, DisplayTitle, MicroLabel } from '@/components/ui/design-tokens';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadFormDialog from '@/components/shared/LeadFormDialog';
import ActivityFormDialog from '@/components/shared/ActivityFormDialog';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import ConvertLeadToClientDialog from '@/components/shared/ConvertLeadToClientDialog';
import { PipelineBoard } from '@/components/crm/PipelineBoard';

// Hooks
import { useLeads } from './hooks/useLeads';
import { useActivities } from './hooks/useActivities';
import { useLeadActions } from './hooks/useLeadActions';
import { useActivityActions } from './hooks/useActivityActions';
import { useCRMFilters } from './hooks/useCRMFilters';

// Components
import { CRMMetrics } from './components/CRMMetrics';
import { CRMFilters } from './components/CRMFilters';
import { LeadsTab } from './components/LeadsTab';
import { ActivitiesTab } from './components/ActivitiesTab';
import { ReportsTab } from './components/ReportsTab';

// Utils
import { calculateCRMStats, filterLeads } from './utils/crmUtils';

const CRM = () => {
  const navigate = useNavigate();
  const { leads, loading, fetchLeads } = useLeads();
  const { activities, loading: activitiesLoading, fetchActivities } = useActivities();
  const filters = useCRMFilters();
  
  const leadActions = useLeadActions(fetchLeads);
  const activityActions = useActivityActions(fetchActivities);

  // Initial data load
   
  useEffect(() => {
    fetchLeads();
    fetchActivities();
  }, [fetchLeads, fetchActivities]);

  // Calculate stats
  const crmStats = calculateCRMStats(leads);

  // Filter leads
  const filteredLeads = filterLeads(leads, filters.searchTerm, filters.statusFilter, filters.priorityFilter);

  return (
    <div className="w-full flex-1 space-y-6 p-2 sm:p-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 px-2 pt-2">
        <div>
          <DisplayTitle>Customer Relationship Management</DisplayTitle>
          <MicroLabel className="mt-2">Manage customer relationships and sales pipeline</MicroLabel>
        </div>
        <PillButton onClick={leadActions.handleNewLead} label="New Lead" icon={Plus} className="w-full sm:w-auto justify-center" />
      </div>

      <CRMMetrics
        totalLeads={crmStats.totalLeads}
        activeLeads={crmStats.activeLeads}
        conversionRate={crmStats.conversionRate}
        pipelineValue={crmStats.pipelineValue}
      />

      <CRMFilters
        searchTerm={filters.searchTerm}
        onSearchChange={filters.setSearchTerm}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={filters.setStatusFilter}
        priorityFilter={filters.priorityFilter}
        onPriorityFilterChange={filters.setPriorityFilter}
      />

      <FloatingCard className="p-4 sm:p-6 mt-4">
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="bg-gray-100/50 p-1 rounded-full border border-gray-200 shadow-inner">
            <TabsTrigger value="leads" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Leads</TabsTrigger>
            <TabsTrigger value="activities" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Activities</TabsTrigger>
            <TabsTrigger value="pipeline" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Pipeline</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leads" className="space-y-4 mt-4 outline-none">
            <LeadsTab
              leads={filteredLeads}
              loading={loading}
              onEditLead={leadActions.handleEditLead}
              onDeleteLead={leadActions.handleDeleteLead}
              onNewActivity={activityActions.handleNewActivity}
              onConvertToClient={leadActions.handleConvertToClient}
              onCreateQuotation={leadActions.handleCreateQuotation}
            />
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4 mt-4 outline-none">
            <ActivitiesTab
              activities={activities}
              loading={activitiesLoading}
              onNewActivity={activityActions.handleNewActivity}
              onEditActivity={activityActions.handleEditActivity}
              onDeleteActivity={activityActions.handleDeleteActivity}
            />
          </TabsContent>
          
          <TabsContent value="pipeline" className="space-y-4 mt-4 outline-none">
            <PipelineBoard
              onLeadClick={(lead) => navigate(`/crm/leads/${lead.id}`)}
              onLeadEdit={leadActions.handleEditLead}
              onLeadDelete={leadActions.handleDeleteLead}
              onLeadConvert={leadActions.handleConvertToClient}
              onScheduleActivity={(lead) => activityActions.handleNewActivity(lead.id)}
              onAddLead={leadActions.handleNewLead}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-4 outline-none">
            <ReportsTab
              leads={leads}
              activities={activities}
              loading={loading}
              activitiesLoading={activitiesLoading}
            />
          </TabsContent>
        </Tabs>
      </FloatingCard>

      <LeadFormDialog
        isOpen={leadActions.leadFormOpen}
        onClose={() => leadActions.setLeadFormOpen(false)}
        lead={leadActions.selectedLead}
        onLeadSaved={leadActions.handleLeadSaved}
      />

      <ActivityFormDialog
        isOpen={activityActions.activityFormOpen}
        onClose={() => {
          activityActions.setActivityFormOpen(false);
          activityActions.setSelectedActivity(null);
        }}
        activity={activityActions.selectedActivity}
        leadId={activityActions.selectedActivity?.lead_id}
        onActivitySaved={activityActions.handleActivitySaved}
      />

      <DeleteConfirmDialog
        isOpen={leadActions.deleteDialogOpen}
        onClose={() => leadActions.setDeleteDialogOpen(false)}
        onDeleted={leadActions.handleLeadDeleted}
        itemType="Lead"
        itemName={leadActions.leadToDelete?.company_name || ''}
        itemId={leadActions.leadToDelete?.id || ''}
        tableName="leads"
      />

      <DeleteConfirmDialog
        isOpen={activityActions.deleteDialogOpen}
        onClose={() => activityActions.setDeleteDialogOpen(false)}
        onDeleted={activityActions.handleActivityDeleted}
        itemType="Activity"
        itemName={activityActions.activityToDelete?.subject || ''}
        itemId={activityActions.activityToDelete?.id || ''}
        tableName="crm_activities"
      />

      <ConvertLeadToClientDialog
        isOpen={leadActions.convertDialogOpen}
        onClose={() => {
          leadActions.setConvertDialogOpen(false);
          leadActions.setLeadToConvert(null);
        }}
        lead={leadActions.leadToConvert}
        onConverted={leadActions.handleLeadConverted}
      />
    </div>
  );
};

export default CRM;
