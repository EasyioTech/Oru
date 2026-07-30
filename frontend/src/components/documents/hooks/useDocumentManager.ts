import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Document, DocumentFolder, FolderForm, ViewMode } from '../types';

export function useDocumentManager() {
  const queryClient = useQueryClient();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data: folders, isLoading: loadingFolders } = useQuery({
    queryKey: ['document-folders'],
    queryFn: async () => (await api.get('/storage/folders')).data.data as DocumentFolder[],
  });

  const { data: documents, isLoading: loadingDocs } = useQuery({
    queryKey: ['documents', currentFolder],
    queryFn: async () => (await api.get(`/storage/documents${currentFolder ? `?folder=${currentFolder}` : ''}`)).data.data as Document[],
  });

  return {
    folders: folders || [],
    documents: documents || [],
    filteredDocuments: (documents || []).filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())),
    subFolders: (folders || []).filter(f => f.parent_folder_id === currentFolder),
    currentFolder, setCurrentFolder,
    currentFolderData: (folders || []).find(f => f.id === currentFolder),
    loading: loadingFolders || loadingDocs,
    searchTerm, setSearchTerm,
    viewMode, setViewMode,
    showFolderDialog: false, setShowFolderDialog: (v: boolean) => {},
    showPermissionsDialog: false, setShowPermissionsDialog: (v: boolean) => {},
    showSettingsDialog: false, setShowSettingsDialog: (v: boolean) => {},
    selectedDocument: null as Document | null, setSelectedDocument: (v: Document | null) => {},
    folderForm: { name: '', description: '' }, setFolderForm: (v: any) => {},
    handleCreateFolder: async () => {},
    handleFileUpload: async () => {},
    handleDownload: async () => {},
    handleOpen: async () => {},
    handleDeleteDocument: async () => {},
    handleDeleteFolder: async () => {},
    handleSettings: () => {},
    updateDocumentField: async () => {},
  };
}
