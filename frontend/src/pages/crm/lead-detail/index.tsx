import { useParams, useNavigate } from 'react-router-dom';
import { useLeadDetail, Activity } from '@/hooks/useLeadDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCheck } from 'lucide-react';

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { lead, activities, leadLoading, convertLead } = useLeadDetail(leadId!);

  if (leadLoading) return <div className="p-8 text-center animate-pulse">Loading...</div>;
  if (!lead) return <div className="p-8 text-center">Lead not found</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.company_name || lead.name}</h1>
            <p className="text-muted-foreground">{lead.email} • {lead.phone}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{lead.status}</Badge>
          <Button onClick={() => convertLead.mutate()} disabled={convertLead.isPending}>
            <UserCheck className="h-4 w-4 mr-2" /> Convert to Client
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Value</p><p>₹{lead.value || 0}</p></div>
                <div><p className="text-sm text-muted-foreground">Priority</p><p>{lead.priority}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activities">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {activities?.length === 0 ? <p className="text-muted-foreground">No activities found.</p> : null}
              {activities?.map((a: Activity) => (
                <div key={a.id} className="border p-4 rounded-md">
                  <h4 className="font-semibold">{a.subject}</h4>
                  <p className="text-sm text-muted-foreground">{a.activity_type} • {a.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{lead.notes || 'No notes available.'}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
