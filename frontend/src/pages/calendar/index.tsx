import React from 'react';
import { AgencyCalendar } from '@/components/calendar/AgencyCalendar';
import { PageContainer, PageHeader } from '@/components/layout';

export default function Calendar() {
  return (
    <PageContainer>
      <PageHeader 
        title="Calendar"
        description="View company events, holidays, team leave, and birthdays"
      />
      
      <AgencyCalendar />
    </PageContainer>
  );
}