import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Search, Grid, List, Loader2 } from 'lucide-react';
import { useDocumentManager } from './hooks/useDocumentManager';
import { FoldersGrid } from './FoldersGrid';
import { DocumentsGrid } from './DocumentsGrid';
import { DocumentSettingsDialog, CreateFolderDialog, DocumentPermissionsDialog } from './DocumentDialogs';

export function DocumentManager() {
  const {
    filteredDocuments, subFolders, currentFolder, setCurrentFolder,
    currentFolderData, loading, searchTerm, setSearchTerm, viewMode, setViewMode,
    showFolderDialog, setShowFolderDialog, showPermissionsDialog, setShowPermissionsDialog,
    showSettingsDialog, setShowSettingsDialog, selectedDocument, setSelectedDocument,
    folderForm, setFolderForm,
    handleCreateFolder, handleFileUpload, handleDownload, handleOpen,
    handleDeleteDocument, handleDeleteFolder, handleSettings, updateDocumentField,
  } = useDocumentManager();

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Organize and manage your files with version control</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowFolderDialog(true)}><Plus className="h-4 w-4 mr-2" />New Folder</Button>
          <Button onClick={() => globalThis.document.getElementById('file-upload')?.click()}><Upload className="h-4 w-4 mr-2" />Upload File</Button>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)} className={!currentFolder ? 'text-foreground' : ''}>Root</Button>
        {currentFolderData && <><span>/</span><span className="text-foreground">{currentFolderData.name}</span></>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <FoldersGrid folders={subFolders} viewMode={viewMode} onOpen={setCurrentFolder} />

      <DocumentsGrid
        documents={filteredDocuments}
        viewMode={viewMode}
        searchTerm={searchTerm}
        onOpen={handleOpen}
        onDownload={handleDownload}
        onSettings={handleSettings}
        onShare={doc => { setSelectedDocument(doc); setShowPermissionsDialog(true); }}
        onDelete={handleDeleteDocument}
        onUploadClick={() => globalThis.document.getElementById('file-upload')?.click()}
      />

      <DocumentSettingsDialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        document={selectedDocument}
        onUpdateField={updateDocumentField}
      />

      <CreateFolderDialog
        open={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
        form={folderForm}
        onChange={setFolderForm}
        onSubmit={handleCreateFolder}
      />

      <DocumentPermissionsDialog
        open={showPermissionsDialog}
        onClose={() => setShowPermissionsDialog(false)}
        documentName={selectedDocument?.name}
      />
    </div>
  );
}
