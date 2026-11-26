import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Document, DocumentFolder, FolderForm, ViewMode } from '../types';

export function useDocumentManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Dialog States
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [folderForm, setFolderForm] = useState<FolderForm>({ name: '', description: '' });

  // Queries
  const { data: folders, isLoading: loadingFolders } = useQuery({
    queryKey: ['document-folders'],
    queryFn: async () => {
      const res = await api.get('/storage/folders');
      return (res.data?.data || res.data || []) as DocumentFolder[];
    },
  });

  const { data: documents, isLoading: loadingDocs } = useQuery({
    queryKey: ['documents', currentFolder],
    queryFn: async () => {
      const res = await api.get(`/storage/documents${currentFolder ? `?folder=${currentFolder}` : ''}`);
      return (res.data?.data || res.data || []) as Document[];
    },
  });

  // Action: Create Folder
  const handleCreateFolder = async () => {
    if (!folderForm.name.trim()) {
      toast({ title: 'Validation Error', description: 'Folder name is required', variant: 'destructive' });
      return;
    }
    try {
      await api.post('/storage/folders', {
        name: folderForm.name.trim(),
        description: folderForm.description.trim() || null,
        parent_folder_id: currentFolder || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['document-folders'] });
      setFolderForm({ name: '', description: '' });
      setShowFolderDialog(false);
      toast({ title: 'Success', description: 'Folder created successfully' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || err.message || 'Failed to create folder',
        variant: 'destructive',
      });
    }
  };

  // Action: File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', 'document');
      formData.append('bucket', 'documents');

      const uploadRes = await api.post('/storage/upload?context=document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadData = uploadRes.data?.data || uploadRes.data || {};
      const storageKey = uploadData.key || uploadData.url || file.name;

      // Register document metadata in database
      await api.post('/storage/documents', {
        name: file.name,
        description: '',
        file_path: storageKey,
        file_size: file.size,
        file_type: file.type || 'application/octet-stream',
        folder_id: currentFolder || null,
        is_public: false,
        tags: [],
      });

      await queryClient.invalidateQueries({ queryKey: ['documents', currentFolder] });
      toast({ title: 'Upload Successful', description: `${file.name} uploaded.` });
      // Clear file input
      e.target.value = '';
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.response?.data?.message || err.message || 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  // Action: Download
  const handleDownload = (doc: Document) => {
    try {
      const fileUrl = doc.file_path.startsWith('http') || doc.file_path.startsWith('/api')
        ? doc.file_path
        : `/api/storage/files/${encodeURIComponent(doc.file_path)}`;
      
      const link = globalThis.document.createElement('a');
      link.href = fileUrl;
      link.download = doc.name;
      link.target = '_blank';
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
    } catch (err: any) {
      toast({ title: 'Download error', description: err.message, variant: 'destructive' });
    }
  };

  // Action: Open / View
  const handleOpen = (doc: Document) => {
    const fileUrl = doc.file_path.startsWith('http') || doc.file_path.startsWith('/api')
      ? doc.file_path
      : `/api/storage/files/${encodeURIComponent(doc.file_path)}`;
    window.open(fileUrl, '_blank');
  };

  // Action: Delete Document
  const handleDeleteDocument = async (doc: Document) => {
    try {
      await api.delete(`/storage/documents/${doc.id}`);
      await queryClient.invalidateQueries({ queryKey: ['documents', currentFolder] });
      toast({ title: 'Deleted', description: `${doc.name} deleted successfully.` });
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || err.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  // Action: Delete Folder
  const handleDeleteFolder = async (folderId: string) => {
    try {
      await api.delete(`/storage/folders/${folderId}`);
      await queryClient.invalidateQueries({ queryKey: ['document-folders'] });
      toast({ title: 'Deleted', description: 'Folder deleted successfully.' });
      if (currentFolder === folderId) {
        setCurrentFolder(null);
      }
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.response?.data?.message || err.message || 'Failed to delete folder',
        variant: 'destructive',
      });
    }
  };

  // Action: Open Document Settings Dialog
  const handleSettings = (doc: Document) => {
    setSelectedDocument(doc);
    setShowSettingsDialog(true);
  };

  // Action: Update Document Settings / Metadata
  const updateDocumentField = async (field: Partial<Document>) => {
    if (!selectedDocument) return;
    try {
      const res = await api.patch(`/storage/documents/${selectedDocument.id}`, field);
      const updated = (res.data?.data || res.data) as Document;
      setSelectedDocument(prev => (prev ? { ...prev, ...field } : null));
      await queryClient.invalidateQueries({ queryKey: ['documents', currentFolder] });
      toast({ title: 'Updated', description: 'Document settings saved.' });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.response?.data?.message || err.message || 'Failed to update document settings',
        variant: 'destructive',
      });
    }
  };

  const allFolders = folders || [];
  const allDocs = documents || [];

  return {
    folders: allFolders,
    documents: allDocs,
    filteredDocuments: allDocs.filter(d => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase())),
    subFolders: allFolders.filter(f => f.parent_folder_id === currentFolder),
    currentFolder,
    setCurrentFolder,
    currentFolderData: allFolders.find(f => f.id === currentFolder),
    loading: loadingFolders || loadingDocs,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    showFolderDialog,
    setShowFolderDialog,
    showPermissionsDialog,
    setShowPermissionsDialog,
    showSettingsDialog,
    setShowSettingsDialog,
    selectedDocument,
    setSelectedDocument,
    folderForm,
    setFolderForm,
    handleCreateFolder,
    handleFileUpload,
    handleDownload,
    handleOpen,
    handleDeleteDocument,
    handleDeleteFolder,
    handleSettings,
    updateDocumentField,
  };
}
