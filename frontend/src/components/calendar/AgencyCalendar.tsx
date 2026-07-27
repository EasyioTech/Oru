import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function AgencyCalendar() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => (await api.get('/calendar/events')).data.data || []
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-8" />;

  return (
    <Card>
      <CardHeader><CardTitle>Agency Calendar</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event: any) => (
            <div key={event.id} className="p-2 border rounded">
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">{new Date(event.start_date).toLocaleDateString()}</p>
            </div>
          ))}
          {events.length === 0 && <p className="text-muted-foreground">No upcoming events.</p>}
        </div>
      </CardContent>
    </Card>
  );
}