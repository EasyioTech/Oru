import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { Integration } from '@/services/api/integrations';

interface IntegrationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Partial<Integration>;
  onFormDataChange: (data: Partial<Integration>) => void;
  selectedIntegration: Integration | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const IntegrationFormDialog = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  selectedIntegration,
  onSubmit,
  isSubmitting,
}: IntegrationFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {selectedIntegration ? 'Edit Integration' : 'Create Integration'}
        </DialogTitle>
        <DialogDescription>
          {selectedIntegration
            ? 'Update integration settings'
            : 'Create a new integration connection'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="Integration name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Integration Type *</Label>
            <Select
              value={formData.integration_type}
              onValueChange={(value) => onFormDataChange({ ...formData, integration_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="make">Make</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Provider</Label>
            <Input
              value={formData.provider}
              onChange={(e) => onFormDataChange({ ...formData, provider: e.target.value })}
              placeholder="e.g., Google, Microsoft"
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="Integration description"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => onFormDataChange({ ...formData, status: value as Integration['status'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Authentication Type</Label>
            <Select
              value={formData.authentication_type}
              onValueChange={(value) => onFormDataChange({ ...formData, authentication_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="oauth">OAuth</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Webhook URL</Label>
          <Input
            value={formData.webhook_url}
            onChange={(e) => onFormDataChange({ ...formData, webhook_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>API Endpoint</Label>
          <Input
            value={formData.api_endpoint}
            onChange={(e) => onFormDataChange({ ...formData, api_endpoint: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.sync_enabled}
            onCheckedChange={(checked) => onFormDataChange({ ...formData, sync_enabled: checked })}
          />
          <Label>Enable Sync</Label>
        </div>
        {formData.sync_enabled && (
          <div>
            <Label>Sync Frequency</Label>
            <Select
              value={formData.sync_frequency}
              onValueChange={(value) => onFormDataChange({ ...formData, sync_frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real_time">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {selectedIntegration ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
