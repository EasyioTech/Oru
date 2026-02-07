import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteRecord, updateRecord } from '@/services/api/core';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  itemType: string;
  itemName: string;
  itemId: string;
  tableName: string;
  softDelete?: boolean; // If true, sets is_active to false instead of hard delete
  userId?: string; // Current user ID for audit logging
  /** Optional custom description (e.g. "This will deactivate the department." vs "This will permanently remove...") */
  description?: string;
  /** When provided, called instead of updateRecord/deleteRecord (e.g. for departments API). Receives softDelete: true = archive, false = hard delete. */
  onConfirm?: (softDelete: boolean) => Promise<void>;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onDeleted,
  itemType,
  itemName,
  itemId,
  tableName,
  softDelete = false,
  userId,
  description: customDescription,
  onConfirm: customOnConfirm,
}) => {
  const { toast } = useToast();
  const defaultDescription = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
  const description = customDescription ?? defaultDescription;
  const isArchive = softDelete || tableName === 'users';
  const actionLabel = isArchive ? 'Archive' : 'Delete';
  const titleLabel = isArchive ? 'Archive' : 'Delete';

  const handleDelete = async () => {
    try {
      if (customOnConfirm) {
        await customOnConfirm(isArchive);
        toast({
          title: 'Success',
          description: isArchive ? `${itemType} deactivated successfully` : `${itemType} deleted successfully`,
        });
      } else if (isArchive) {
        await updateRecord(tableName, { is_active: false }, { id: itemId }, userId);
        toast({
          title: 'Success',
          description: `${itemType} deactivated successfully`,
        });
      } else {
        await deleteRecord(tableName, { id: itemId });
        toast({
          title: 'Success',
          description: `${itemType} deleted successfully`,
        });
      }

      onDeleted();
      onClose();
    } catch (error: any) {
      console.error(`Error deleting ${itemType}:`, error);
      toast({
        title: 'Error',
        description: error.message || error.detail || `Failed to delete ${itemType.toLowerCase()}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titleLabel} {itemType}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;