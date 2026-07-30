import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import type { SupportTicket } from '@/services/api/system';
import { getPriorityColor, getStatusColor } from './utils';

interface Props {
  ticket: SupportTicket | null;
  open: boolean;
  onClose: () => void;
  onEdit: (t: SupportTicket) => void;
}

export function TicketViewDialog({ ticket, open, onClose, onEdit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogDescription>View complete information about this support ticket</DialogDescription>
        </DialogHeader>
        {ticket && (
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Ticket Number</Label><p className="font-medium">{ticket.ticket_number}</p></div>
              <div><Label className="text-muted-foreground">Status</Label><div><Badge variant={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge></div></div>
              <div><Label className="text-muted-foreground">Priority</Label><div><Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge></div></div>
              <div><Label className="text-muted-foreground">Category</Label><p className="font-medium">{ticket.category}</p></div>
              {ticket.department && <div><Label className="text-muted-foreground">Department</Label><p className="font-medium">{ticket.department}</p></div>}
              {ticket.page_url && (
                <div><Label className="text-muted-foreground">Page URL</Label>
                  <p className="text-sm text-blue-600 break-all"><a href={ticket.page_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{ticket.page_url}</a></p>
                </div>
              )}
            </div>
            <div><Label className="text-muted-foreground">Title</Label><p className="font-medium">{ticket.title}</p></div>
            <div><Label className="text-muted-foreground">Description</Label><p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{ticket.description}</p></div>

            {ticket.console_logs && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <Label className="text-muted-foreground mb-2 block font-semibold">
                  Console Logs ({Array.isArray(ticket.console_logs) ? ticket.console_logs.length : 0} entries)
                </Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {Array.isArray(ticket.console_logs) && ticket.console_logs.map((log: any, idx: number) => {
                    const l = log as { level?: string; timestamp?: string; message?: string; stack?: string };
                    return (
                      <div key={idx} className="text-xs font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={l.level === 'error' ? 'destructive' : l.level === 'warn' ? 'outline' : 'secondary'} className="text-xs">{l.level}</Badge>
                          <span className="text-muted-foreground">{l.timestamp ? new Date(l.timestamp).toLocaleString() : ''}</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs">{l.message}</pre>
                        {l.stack && <details className="mt-1"><summary className="cursor-pointer text-xs text-muted-foreground">Stack Trace</summary><pre className="mt-1 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">{l.stack}</pre></details>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {ticket.error_details && (
              <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <Label className="text-muted-foreground mb-2 block font-semibold">Error Details</Label>
                <div className="space-y-2 text-sm">
                  {ticket.error_details.error_count !== undefined && <div><span className="font-medium">Errors: </span><Badge variant="destructive">{ticket.error_details.error_count}</Badge></div>}
                  {ticket.error_details.warning_count !== undefined && <div><span className="font-medium">Warnings: </span><Badge variant="outline">{ticket.error_details.warning_count}</Badge></div>}
                  {ticket.error_details.recent_errors?.length > 0 && (
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">Recent Errors:</Label>
                      <div className="mt-1 space-y-1">
                        {ticket.error_details.recent_errors.slice(0, 5).map((err: any, idx: number) => (
                          <div key={idx} className="text-xs bg-white dark:bg-gray-800 p-2 rounded">{(err as { message?: string })?.message}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {ticket.browser_info && (
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                <Label className="text-muted-foreground mb-2 block font-semibold">Browser Information</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {ticket.browser_info.userAgent && <div><span className="font-medium">User Agent: </span><span className="text-muted-foreground break-all">{ticket.browser_info.userAgent}</span></div>}
                  {ticket.browser_info.platform && <div><span className="font-medium">Platform: </span><span className="text-muted-foreground">{ticket.browser_info.platform}</span></div>}
                  {ticket.browser_info.viewport && <>
                    <div><span className="font-medium">Viewport: </span><span className="text-muted-foreground">{ticket.browser_info.viewport.width} × {ticket.browser_info.viewport.height}</span></div>
                    <div><span className="font-medium">Screen: </span><span className="text-muted-foreground">{ticket.browser_info.screen?.width} × {ticket.browser_info.screen?.height}</span></div>
                  </>}
                  {ticket.browser_info.language && <div><span className="font-medium">Language: </span><span className="text-muted-foreground">{ticket.browser_info.language}</span></div>}
                  {ticket.browser_info.onLine !== undefined && <div><span className="font-medium">Online: </span><span className="text-muted-foreground">{ticket.browser_info.onLine ? 'Yes' : 'No'}</span></div>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div><Label className="text-muted-foreground">Created</Label><p className="text-sm">{new Date(ticket.created_at).toLocaleString()}</p></div>
              <div><Label className="text-muted-foreground">Last Updated</Label><p className="text-sm">{new Date(ticket.updated_at).toLocaleString()}</p></div>
              {ticket.resolved_at && <div><Label className="text-muted-foreground">Resolved</Label><p className="text-sm">{new Date(ticket.resolved_at).toLocaleString()}</p></div>}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {ticket && <Button onClick={() => { onClose(); onEdit(ticket); }}><Edit className="mr-2 h-4 w-4" />Edit Ticket</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
