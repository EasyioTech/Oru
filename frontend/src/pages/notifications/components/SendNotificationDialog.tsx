import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Send } from 'lucide-react';
import type { NotificationUser, SendForm } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: NotificationUser[];
  sendForm: SendForm;
  setSendForm: (form: SendForm) => void;
  sending: boolean;
  onSend: () => void;
}

export function SendNotificationDialog({ open, onOpenChange, users, sendForm, setSendForm, sending, onSend }: Props) {
  const set = <K extends keyof SendForm>(key: K, value: SendForm[K]) => setSendForm({ ...sendForm, [key]: value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Send className="w-4 h-4 mr-2" />Send Notification</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>Send a notification to one or more users</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recipients *</Label>
            <Select value={sendForm.userIds.length > 0 ? 'selected' : ''} onValueChange={() => {}}>
              <SelectTrigger><SelectValue placeholder="Select users" /></SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {users.map(u => (
                    <div key={u.id} className="flex items-center space-x-2 px-2 py-1.5">
                      <Checkbox
                        checked={sendForm.userIds.includes(u.id)}
                        onCheckedChange={(checked) =>
                          set('userIds', checked
                            ? [...sendForm.userIds, u.id]
                            : sendForm.userIds.filter(id => id !== u.id))
                        }
                      />
                      <Label className="font-normal cursor-pointer">{u.full_name || u.email}</Label>
                    </div>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            {sendForm.userIds.length > 0 && (
              <p className="text-sm text-muted-foreground">{sendForm.userIds.length} user(s) selected</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={sendForm.type} onValueChange={(v: SendForm['type']) => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={sendForm.category} onValueChange={(v: SendForm['category']) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={sendForm.priority} onValueChange={(v: SendForm['priority']) => set('priority', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={sendForm.title} onChange={e => set('title', e.target.value)} placeholder="Notification title" />
          </div>
          <div className="space-y-2">
            <Label>Message *</Label>
            <Textarea value={sendForm.message} onChange={e => set('message', e.target.value)} placeholder="Notification message" rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Action URL (optional)</Label>
            <Input value={sendForm.actionUrl} onChange={e => set('actionUrl', e.target.value)} placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label>Expires At (optional)</Label>
            <Input type="datetime-local" value={sendForm.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSend} disabled={sending}>
            {sending ? <LoadingSpinner size="sm" /> : 'Send Notification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
