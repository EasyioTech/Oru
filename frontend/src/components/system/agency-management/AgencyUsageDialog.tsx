import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, DollarSign, Building2, Activity, Loader2 } from 'lucide-react';
import type { AgencyDetails, AgencyUsage } from '@/services/api/agencies';

interface Props {
  open: boolean;
  onClose: () => void;
  agency: AgencyDetails | null;
  usage: AgencyUsage | null;
  isLoading: boolean;
}

const USAGE_STATS = [
  { key: 'users' as const, label: 'Users', icon: Users },
  { key: 'projects' as const, label: 'Projects', icon: FileText },
  { key: 'invoices' as const, label: 'Invoices', icon: DollarSign },
  { key: 'clients' as const, label: 'Clients', icon: Building2 },
];

export function AgencyUsageDialog({ open, onClose, agency, usage, isLoading }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Usage Statistics - {agency?.name}</DialogTitle>
          <DialogDescription>Platform usage metrics for this agency</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : usage ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {USAGE_STATS.map(({ key, label, icon: Icon }) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{usage[key]}</p></div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-muted-foreground">Tasks</p><p className="text-2xl font-bold">{usage.tasks}</p></div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
