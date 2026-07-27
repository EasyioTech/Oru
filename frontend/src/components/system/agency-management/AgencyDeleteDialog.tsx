import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import type { AgencyDetails } from '@/services/api/agencies';

interface Props {
  agency: AgencyDetails | null;
  confirmName: string;
  setConfirmName: (v: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AgencyDeleteDialog({ agency, confirmName, setConfirmName, isDeleting, onClose, onConfirm }: Props) {
  return (
    <Dialog open={!!agency} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete agency permanently</DialogTitle>
          <DialogDescription>
            This will permanently delete the agency and all of its associated data. This action cannot be undone.
            Type the agency name below to confirm.
          </DialogDescription>
        </DialogHeader>
        {agency && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type <span className="font-mono font-semibold text-foreground">&quot;{agency.name}&quot;</span> to confirm:
            </p>
            <Input
              placeholder="Agency name"
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
              className="font-mono"
              autoComplete="off"
              disabled={isDeleting}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!agency || confirmName.trim() !== agency?.name || isDeleting}
          >
            {isDeleting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              : <><Trash2 className="mr-2 h-4 w-4" />Delete permanently</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
