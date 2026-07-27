import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchTicketSummary, fetchTickets, fetchTicket,
  createTicket, updateTicket, deleteTicket,
  type TicketStats, type RecentTicket, type SupportTicket, type CreateTicketData,
} from '@/services/api/system';

const DEFAULT_FORM: CreateTicketData = {
  title: '', description: '', priority: 'medium', category: 'general', status: 'open',
};

export function useSupportTickets() {
  const { toast } = useToast();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState<CreateTicketData>(DEFAULT_FORM);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchTicketSummary();
      setStats(data.stats || null);
      setRecentTickets(Array.isArray(data.recentTickets) ? data.recentTickets : []);
      const tickets = await fetchTickets({ limit: 100 });
      setAllTickets(Array.isArray(tickets) ? tickets : []);
    } catch (err: unknown) {
      setStats(null); setRecentTickets([]); setAllTickets([]);
      toast({ title: 'Error loading ticket data', description: (err as Error)?.message || 'Failed to load tickets', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!ticketForm.title || !ticketForm.description) {
      toast({ title: 'Validation Error', description: 'Title and description are required', variant: 'destructive' });
      return;
    }
    try {
      await createTicket(ticketForm);
      toast({ title: 'Success', description: 'Ticket created successfully' });
      setIsCreateOpen(false); setTicketForm({ ...DEFAULT_FORM }); loadData();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error)?.message || 'Failed to create ticket', variant: 'destructive' });
    }
  };

  const handleView = async (ticketId: string) => {
    try {
      const ticket = await fetchTicket(ticketId);
      setSelectedTicket(ticket); setIsViewOpen(true);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error)?.message || 'Failed to load ticket details', variant: 'destructive' });
    }
  };

  const openEdit = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketForm({ title: ticket.title, description: ticket.description, status: ticket.status, priority: ticket.priority, category: ticket.category });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedTicket) return;
    try {
      await updateTicket(selectedTicket.id, {
        title: ticketForm.title || selectedTicket.title,
        description: ticketForm.description || selectedTicket.description,
        status: ticketForm.status || selectedTicket.status,
        priority: ticketForm.priority || selectedTicket.priority,
        category: ticketForm.category || selectedTicket.category,
      });
      toast({ title: 'Success', description: 'Ticket updated successfully' });
      setIsEditOpen(false); setSelectedTicket(null); loadData();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error)?.message || 'Failed to update ticket', variant: 'destructive' });
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
    try {
      setIsDeleting(ticketId);
      await deleteTicket(ticketId);
      toast({ title: 'Success', description: 'Ticket deleted successfully' });
      loadData();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error)?.message || 'Failed to delete ticket', variant: 'destructive' });
    } finally { setIsDeleting(null); }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicket(ticketId, { status: newStatus as unknown });
      toast({ title: 'Success', description: 'Ticket status updated' });
      loadData();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error)?.message || 'Failed to update ticket status', variant: 'destructive' });
    }
  };

  const openCreate = () => { setTicketForm({ ...DEFAULT_FORM }); setIsCreateOpen(true); };

  return {
    stats, recentTickets, allTickets, loading, selectedTicket,
    isCreateOpen, setIsCreateOpen, isViewOpen, setIsViewOpen, isEditOpen, setIsEditOpen,
    isDeleting, ticketForm, setTicketForm,
    loadData, handleCreate, handleView, openEdit, handleEdit, handleDelete, handleStatusChange, openCreate,
  };
}
