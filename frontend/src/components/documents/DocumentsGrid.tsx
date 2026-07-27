import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, Download, Eye, Edit, Share2, Trash2, Lock, Unlock } from 'lucide-react';
import { formatFileSize, getFileIcon } from './utils';
import type { Document, ViewMode } from './types';

interface Props {
  documents: Document[];
  viewMode: ViewMode;
  searchTerm: string;
  onOpen: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onSettings: (doc: Document) => void;
  onShare: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onUploadClick: () => void;
}

export function DocumentsGrid({ documents, viewMode, searchTerm, onOpen, onDownload, onSettings, onShare, onDelete, onUploadClick }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Documents ({documents.length})</h3>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-muted-foreground mb-4">{searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}</p>
            {!searchTerm && (
              <Button onClick={onUploadClick}><Upload className="h-4 w-4 mr-2" />Upload File</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {documents.map(doc => (
            <Card key={doc.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getFileIcon(doc.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onOpen(doc)} title="Open/View"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => onDownload(doc)} title="Download"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => onSettings(doc)} title="Settings"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => onShare(doc)} title="Share"><Share2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(doc)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">Downloaded {doc.download_count} times</span>
                      {doc.is_public ? <Unlock className="h-3 w-3 text-green-500" /> : <Lock className="h-3 w-3 text-gray-500" />}
                    </div>
                    {(doc.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(doc.tags || []).slice(0, 3).map((tag, i) => <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>)}
                        {(doc.tags || []).length > 3 && <Badge variant="outline" className="text-xs">+{(doc.tags || []).length - 3}</Badge>}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
