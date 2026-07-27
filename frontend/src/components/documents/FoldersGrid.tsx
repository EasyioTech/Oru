import { Card, CardContent } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import type { DocumentFolder, ViewMode } from './types';

interface Props {
  folders: DocumentFolder[];
  viewMode: ViewMode;
  onOpen: (folderId: string) => void;
}

export function FoldersGrid({ folders, viewMode, onOpen }: Props) {
  if (folders.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Folders</h3>
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}>
        {folders.map(folder => (
          <Card key={folder.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOpen(folder.id)}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Folder className="h-8 w-8 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{folder.name}</p>
                  {folder.description && <p className="text-sm text-muted-foreground truncate">{folder.description}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
