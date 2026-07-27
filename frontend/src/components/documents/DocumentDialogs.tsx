import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Share2 } from 'lucide-react';
import { formatFileSize } from './utils';
import type { Document, FolderForm } from './types';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onUpdateField: (field: Partial<Document>) => void;
}

export function DocumentSettingsDialog({ open, onClose, document: doc, onUpdateField }: SettingsDialogProps) {
  if (!doc) return null;
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
          <DialogDescription>Manage settings for {doc.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Document Name</Label>
            <Input defaultValue={doc.name} onBlur={e => e.target.value !== doc.name && onUpdateField({ name: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea defaultValue={doc.description || ''} onBlur={e => onUpdateField({ description: e.target.value || undefined })} placeholder="Add a description..." />
          </div>
          <div>
            <Label>Visibility</Label>
            <Select defaultValue={doc.is_public ? 'public' : 'private'} onValueChange={v => onUpdateField({ is_public: v === 'public' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>File Information</Label>
            <div className="text-sm text-muted-foreground space-y-1 mt-2">
              <p>Type: {doc.file_type}</p>
              <p>Size: {formatFileSize(doc.file_size)}</p>
              <p>Path: {doc.file_path}</p>
              <p>Downloads: {doc.download_count}</p>
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FolderDialogProps {
  open: boolean;
  onClose: () => void;
  form: FolderForm;
  onChange: (form: FolderForm) => void;
  onSubmit: () => void;
}

export function CreateFolderDialog({ open, onClose, form, onChange, onSubmit }: FolderDialogProps) {
  const set = (patch: Partial<FolderForm>) => onChange({ ...form, ...patch });
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Create a new folder to organize your documents</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Folder Name</Label><Input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="Folder name" /></div>
          <div><Label>Description (Optional)</Label><Textarea value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Folder description" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  documentName: string | undefined;
}

export function DocumentPermissionsDialog({ open, onClose, documentName }: PermissionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Document Permissions</DialogTitle>
          <DialogDescription>Manage who can access "{documentName}"</DialogDescription>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          <Share2 className="h-12 w-12 mx-auto mb-4" />
          <p>Permission management coming soon</p>
          <p className="text-sm">This feature will allow you to control document access</p>
        </div>
        <DialogFooter><Button onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
