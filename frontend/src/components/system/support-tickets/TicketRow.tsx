import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import type { SupportTicket, RecentTicket } from '@/services/api/system';
import { getPriorityColor, getStatusColor } from './utils';

interface Props {
  ticket: SupportTicket | RecentTicket;
  allTickets: SupportTicket[];
  isDeleting: string | null;
  onView: (id: string) => void;
  onEdit: (t: SupportTicket) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  showDescription?: boolean;
}

export function TicketRow({ ticket, allTickets, isDeleting, onView, onEdit, onDelete, onStatusChange, showDescription }: Props) {
  const full = allTickets.find(t => t.id === ticket.id);
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{ticket.ticket_number}</span>
          <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">{ticket.priority}</Badge>
          <Badge variant={getStatusColor(ticket.status)} className="text-xs">{ticket.status.replace('_', ' ')}</Badge>
        </div>
        <p className={`text-sm mt-1 ${showDescription ? 'font-medium' : 'text-muted-foreground truncate'}`}>{ticket.title}</p>
        {showDescription && 'description' in ticket && (
          <p className="text-sm text-muted-foreground truncate mt-1">{ticket.description}</p>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          {ticket.category} • {showDescription ? `Created: ${new Date(ticket.created_at).toLocaleString()}` : new Date(ticket.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onView(ticket.id)}><Eye className="h-4 w-4" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(ticket.id)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => full && onEdit(full)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'in_progress')}>Mark In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'resolved')}>Mark Resolved</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(ticket.id)} disabled={isDeleting === ticket.id}>
              {isDeleting === ticket.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
