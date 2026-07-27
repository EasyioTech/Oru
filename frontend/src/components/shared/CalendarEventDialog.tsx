import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function CalendarEventDialog({ open, onOpenChange, onEventCreated, editEvent }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(editEvent || {
    title: '', description: '', event_type: 'meeting', start_date: '', end_date: '', is_all_day: false, location: '', color: '#3b82f6'
  });

  const { mutateAsync: saveEvent, isPending } = useMutation({
    mutationFn: async () => {
      if (editEvent?.id) return api.put(`/calendar/events/${editEvent.id}`, formData);
      return api.post('/calendar/events', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event saved');
      onEventCreated?.();
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to save event')
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editEvent ? 'Edit' : 'Create'} Event</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); saveEvent(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.event_type} onValueChange={v => setFormData({ ...formData, event_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}