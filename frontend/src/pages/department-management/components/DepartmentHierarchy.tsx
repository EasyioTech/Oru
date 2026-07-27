import React from 'react';
import { Building2 } from 'lucide-react';
import 'reactflow/dist/style.css';
import { useDepartmentHierarchy } from './hierarchy/useDepartmentHierarchy';
import { HierarchySearchBar } from './hierarchy/components/HierarchySearchBar';
import { HierarchyToolbar } from './hierarchy/components/HierarchyToolbar';
import { HierarchyCanvas } from './hierarchy/components/HierarchyCanvas';
import type { DepartmentHierarchyViewProps } from './hierarchy/types';

export const DepartmentHierarchyView: React.FC<DepartmentHierarchyViewProps> = (props) => {
  const ctx = useDepartmentHierarchy(props);

  if (!ctx.hasRootDepartments) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No departments to display</h3>
          <p className="text-muted-foreground">Add departments to see the hierarchy visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <HierarchySearchBar
        searchTerm={ctx.searchTerm}
        setSearchTerm={ctx.setSearchTerm}
        filterManager={ctx.filterManager}
        setFilterManager={ctx.setFilterManager}
        managers={ctx.managers}
        showStats={ctx.showStats}
        setShowStats={ctx.setShowStats}
        stats={ctx.stats}
        onExport={ctx.handleExport}
      />
      <HierarchyToolbar
        connectionMode={ctx.connectionMode}
        setConnectionMode={ctx.setConnectionMode}
        pendingConnections={ctx.pendingConnections}
        isSaving={ctx.isSaving}
        saveConnections={ctx.saveConnections}
        cancelConnections={ctx.cancelConnections}
        showInactiveDepartments={ctx.showInactiveDepartments}
        setShowInactiveDepartments={ctx.setShowInactiveDepartments}
        zoomLevel={ctx.zoomLevel}
        onZoomIn={ctx.handleZoomIn}
        onZoomOut={ctx.handleZoomOut}
        onFitView={ctx.handleFitView}
        onResetLayout={ctx.buildHierarchy}
      />
      <HierarchyCanvas
        nodes={ctx.nodes}
        edges={ctx.edges}
        onNodesChange={ctx.onNodesChange}
        onEdgesChange={ctx.onEdgesChange}
        connectionMode={ctx.connectionMode}
        onConnect={ctx.onConnect}
        onEdgesDelete={ctx.onEdgesDelete}
        reactFlowInstance={ctx.reactFlowInstance}
        setZoomLevel={ctx.setZoomLevel}
      />
    </div>
  );
};
