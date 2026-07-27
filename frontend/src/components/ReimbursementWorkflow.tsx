import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReimbursementWorkflow({ request }: any) {
  const { data: steps } = useQuery({
    queryKey: ['reimbursement-workflow', request?.id],
    queryFn: async () => (await api.get(`/finance/reimbursements/${request?.id}/workflow`)).data.data || [],
    enabled: !!request?.id
  });

  return (
    <Card>
      <CardHeader><CardTitle>Approval Workflow</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps?.map((step: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium">{step.role}</p>
                <p className="text-sm text-muted-foreground">{step.status}</p>
              </div>
              <p className="text-sm">{step.date}</p>
            </div>
          ))}
          {!steps?.length && <p className="text-muted-foreground text-sm">No workflow data available.</p>}
        </div>
      </CardContent>
    </Card>
  );
}