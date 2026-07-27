import { MutableRefObject } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  Connection,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import { RefreshCw } from 'lucide-react';
import { nodeTypes } from '../DepartmentNode';

interface HierarchyCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  connectionMode: boolean;
  onConnect: (params: Connection) => void;
  onEdgesDelete: (edges: Edge[]) => void;
  reactFlowInstance: MutableRefObject<any>;
  setZoomLevel: (v: number | ((prev: number) => number)) => void;
}

export function HierarchyCanvas({
  nodes, edges, onNodesChange, onEdgesChange,
  connectionMode, onConnect, onEdgesDelete,
  reactFlowInstance, setZoomLevel,
}: HierarchyCanvasProps) {
  return (
    <div className="w-full h-[700px] border rounded-lg bg-background overflow-hidden relative">
      {nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={connectionMode ? onConnect : undefined}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 },
          }}
          connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
          fitViewOptions={{ padding: 0.3, duration: 400 }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          onInit={instance => {
            reactFlowInstance.current = instance;
            setTimeout(() => { if (nodes.length > 0) instance.fitView({ padding: 0.3, duration: 400 }); }, 300);
          }}
          onMove={(_, viewport) => setZoomLevel(viewport.zoom)}
        >
          <Controls />
          <Background color="#e5e7eb" gap={16} />
          <MiniMap
            nodeColor={node => node.data?.level === 0 ? '#3b82f6' : '#94a3b8'}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading hierarchy...</p>
          </div>
        </div>
      )}
    </div>
  );
}
