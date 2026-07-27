import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  processing: boolean;
}

export function ApproveConfirmDialog({ open, onClose, onConfirm, processing }: ConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={v => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Role Change</AlertDialogTitle>
          <AlertDialogDescription>This will approve the role change request and update the user's role immediately. This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={processing}>
            {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function RejectConfirmDialog({ open, onClose, onConfirm, processing }: ConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={v => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Role Change</AlertDialogTitle>
          <AlertDialogDescription>This will reject the role change request. The user's current role will remain unchanged.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={processing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteConfirmDialog({ open, onClose, onConfirm, processing }: ConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={v => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Role Change Request</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to cancel this role change request? This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing}>Keep Request</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={processing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Cancel Request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
