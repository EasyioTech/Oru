import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TicketIcon, Plus, Loader2 } from 'lucide-react';
import { useSupportTickets } from './support-tickets/hooks/useSupportTickets';
import { TicketFormFields } from './support-tickets/TicketFormFields';
import { TicketRow } from './support-tickets/TicketRow';
import { TicketStatsOverview } from './support-tickets/TicketStatsOverview';
import { TicketViewDialog } from './support-tickets/TicketViewDialog';

export const SupportTicketsWidget = () => {
  const {
    stats, recentTickets, allTickets, loading, selectedTicket,
    isCreateOpen, setIsCreateOpen, isViewOpen, setIsViewOpen, isEditOpen, setIsEditOpen,
    isDeleting, ticketForm, setTicketForm,
    handleCreate, handleView, openEdit, handleEdit, handleDelete, handleStatusChange, openCreate,
  } = useSupportTickets();

  const rowProps = {
    allTickets,
    isDeleting,
    onView: handleView,
    onEdit: openEdit,
    onDelete: handleDelete,
    onStatusChange: handleStatusChange,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2"><TicketIcon className="h-5 w-5" />Support Tickets</CardTitle>
        <Button size="sm" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Ticket</Button>
      </CardHeader>
      <CardContent>
        {loading && !stats ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <TicketStatsOverview stats={stats} />
            </TabsContent>

            <TabsContent value="recent" className="space-y-2 pt-4">
              {recentTickets.length === 0
                ? <p className="text-center text-muted-foreground py-4">No recent tickets</p>
                : recentTickets.map(t => <TicketRow key={t.id} ticket={t} {...rowProps} />)}
            </TabsContent>

            <TabsContent value="all" className="space-y-2 pt-4">
              {allTickets.length === 0
                ? <p className="text-center text-muted-foreground py-4">No tickets found</p>
                : allTickets.map(t => <TicketRow key={t.id} ticket={t} showDescription {...rowProps} />)}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>Submit a new support ticket for technical issues or assistance</DialogDescription>
          </DialogHeader>
          <TicketFormFields form={ticketForm} onChange={setTicketForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>Update ticket details and status</DialogDescription>
          </DialogHeader>
          <TicketFormFields form={ticketForm} onChange={setTicketForm} showStatus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <TicketViewDialog
        ticket={selectedTicket}
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        onEdit={openEdit}
      />
    </Card>
  );
};
