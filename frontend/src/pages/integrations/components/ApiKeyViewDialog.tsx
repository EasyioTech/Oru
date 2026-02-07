import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { ApiKey } from '@/services/api/integrations';

interface ApiKeyViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
}

export const ApiKeyViewDialog = ({
  open,
  onOpenChange,
  apiKey,
}: ApiKeyViewDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>API Key Details</DialogTitle>
        <DialogDescription>View API key information</DialogDescription>
      </DialogHeader>
      {apiKey && (
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{apiKey.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Prefix</Label>
            <code className="text-sm font-mono bg-muted p-2 rounded block">
              {apiKey.prefix}...
            </code>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                {apiKey.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Revoked</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Used</Label>
              <p>
                {apiKey.lastUsedAt
                  ? new Date(apiKey.lastUsedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Rate Limit (min)</Label>
              <p>{apiKey.rateLimitPerMinute || 60}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Rate Limit (hour)</Label>
              <p>{apiKey.rateLimitPerHour || 1000}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Rate Limit (day)</Label>
              <p>{apiKey.rateLimitPerDay || 10000}</p>
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
