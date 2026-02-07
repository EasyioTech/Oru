import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Quotation, Client, QuotationTemplate } from './types';

interface QuotationHeaderFormProps {
  formData: Quotation;
  onFormDataChange: (updates: Partial<Quotation>) => void;
  clients: Client[];
  templates: QuotationTemplate[];
  loadingClients: boolean;
  onTyping: () => void;
  onUseTemplate: (templateId: string) => void;
}

export const QuotationHeaderForm = ({
  formData,
  onFormDataChange,
  clients,
  templates,
  loadingClients,
  onTyping,
  onUseTemplate
}: QuotationHeaderFormProps) => (
  <>
    {templates.length > 0 && (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Start: Use Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={onUseTemplate} value={formData.template_id || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template to pre-fill form (optional)" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    )}

    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quotation Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                onTyping();
                onFormDataChange({ title: e.target.value });
              }}
              placeholder="e.g., Website Development Project"
              required
            />
            <p className="text-xs text-muted-foreground">A clear title for this quotation</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => {
                onTyping();
                onFormDataChange({ client_id: value });
              }}
              disabled={loadingClients}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name || client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">The client this quotation is for</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              onTyping();
              onFormDataChange({ description: e.target.value });
            }}
            placeholder="Brief description of the quotation..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">Optional description of what this quotation covers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issue_date">Issue Date *</Label>
            <Input
              id="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={(e) => {
                onTyping();
                onFormDataChange({ issue_date: e.target.value });
              }}
              required
            />
            <p className="text-xs text-muted-foreground">When this quotation is issued</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid_until">Valid Until</Label>
            <Input
              id="valid_until"
              type="date"
              value={formData.valid_until}
              onChange={(e) => {
                onTyping();
                onFormDataChange({ valid_until: e.target.value });
              }}
            />
            <p className="text-xs text-muted-foreground">Expiry date for this quotation</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                onTyping();
                onFormDataChange({ status: value });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Current status of quotation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </>
);
