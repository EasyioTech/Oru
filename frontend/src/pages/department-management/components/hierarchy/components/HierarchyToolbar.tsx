import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, RefreshCw, Eye, ZoomIn, ZoomOut, Maximize2, Save, X } from 'lucide-react';

interface HierarchyToolbarProps {
  connectionMode: boolean;
  setConnectionMode: (v: boolean) => void;
  pendingConnections: Map<string, string>;
  isSaving: boolean;
  saveConnections: () => void;
  cancelConnections: () => void;
  showInactiveDepartments: boolean;
  setShowInactiveDepartments: (v: boolean) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetLayout: () => void;
}

export function HierarchyToolbar({
  connectionMode, setConnectionMode, pendingConnections, isSaving, saveConnections, cancelConnections,
  showInactiveDepartments, setShowInactiveDepartments, zoomLevel, onZoomIn, onZoomOut, onFitView, onResetLayout,
}: HierarchyToolbarProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant={connectionMode ? 'default' : 'outline'} size="sm" onClick={() => setConnectionMode(!connectionMode)}>
              <Link className="h-4 w-4 mr-2" />
              {connectionMode ? 'Exit Connection Mode' : 'Connection Mode'}
            </Button>
            {!connectionMode && (
              <>
                <Button variant="outline" size="sm" onClick={onResetLayout} title="Reset layout">
                  <RefreshCw className="h-4 w-4 mr-2" />Reset Layout
                </Button>
                <Button variant={showInactiveDepartments ? 'default' : 'outline'} size="sm" onClick={() => setShowInactiveDepartments(!showInactiveDepartments)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showInactiveDepartments ? 'Show Active Only' : 'Show All'}
                </Button>
                <div className="flex items-center gap-1 border rounded-md">
                  <Button variant="ghost" size="sm" onClick={onZoomOut} className="h-8 px-2">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2 min-w-[50px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button variant="ghost" size="sm" onClick={onZoomIn} className="h-8 px-2">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onFitView} className="h-8 px-2">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            {pendingConnections.size > 0 && (
              <>
                <Button variant="default" size="sm" onClick={saveConnections} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : `Save ${pendingConnections.size} Connection(s)`}
                </Button>
                <Button variant="outline" size="sm" onClick={cancelConnections}>
                  <X className="h-4 w-4 mr-2" />Cancel
                </Button>
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {connectionMode ? (
              'Drag from one department to another to create a connection'
            ) : (
              <>Drag nodes to reposition • <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd</kbd> + Drag to pan</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
