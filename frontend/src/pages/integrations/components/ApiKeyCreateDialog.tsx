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
import { Copy, Loader2 } from 'lucide-react';

interface ApiKeyFormData {
  name: string;
  permissions: Record<string, unknown>;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  expiresAt: string;
  prefix: string;
}

interface ApiKeyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ApiKeyFormData;
  onFormDataChange: (data: ApiKeyFormData) => void;
  newApiKey: string;
  onSubmit: () => void;
  onCopyKey: (key: string) => void;
  onDone: () => void;
  isSubmitting: boolean;
}

export const ApiKeyCreateDialog = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  newApiKey,
  onSubmit,
  onCopyKey,
  onDone,
  isSubmitting,
}: ApiKeyCreateDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogDescription>
          Create a new API key for external access. Store it securely - it will only be shown once.
        </DialogDescription>
      </DialogHeader>
      {newApiKey ? (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <Label className="text-muted-foreground">Your API Key</Label>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 text-sm font-mono bg-background p-2 rounded">
                {newApiKey}
              </code>
              <Button variant="outline" size="sm" onClick={() => onCopyKey(newApiKey)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Copy this key now. It will not be shown again.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onDone}>Done</Button>
          </DialogFooter>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="API key name"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Rate Limit (per minute)</Label>
                <Input
                  type="number"
                  value={formData.rateLimitPerMinute}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      rateLimitPerMinute: parseInt(e.target.value) || 60,
                    })
                  }
                />
              </div>
              <div>
                <Label>Rate Limit (per hour)</Label>
                <Input
                  type="number"
                  value={formData.rateLimitPerHour}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      rateLimitPerHour: parseInt(e.target.value) || 1000,
                    })
                  }
                />
              </div>
              <div>
                <Label>Rate Limit (per day)</Label>
                <Input
                  type="number"
                  value={formData.rateLimitPerDay}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      rateLimitPerDay: parseInt(e.target.value) || 10000,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Expires At (optional)</Label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => onFormDataChange({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>
);
