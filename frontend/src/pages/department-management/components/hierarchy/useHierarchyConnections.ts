import { useState, useCallback } from 'react';
import { Edge, Connection, addEdge, MarkerType } from 'reactflow';
import type { Department } from './types';

type ToastFn = (opts: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;

interface UseHierarchyConnectionsParams {
  departments: Department[];
  toast: ToastFn;
  db: any;
  onRefresh?: () => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
}

export function useHierarchyConnections({ departments, toast, db, onRefresh, setEdges }: UseHierarchyConnectionsParams) {
  const [connectionMode, setConnectionMode] = useState(false);
  const [pendingConnections, setPendingConnections] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    if (params.source === params.target) {
      toast({ title: 'Invalid Connection', description: 'A department cannot be connected to itself', variant: 'destructive' });
      return;
    }
    const targetDept = departments.find(d => d.id === params.target);
    if (targetDept?.parent_department_id && targetDept.parent_department_id !== params.source) {
      toast({ title: 'Connection Exists', description: 'This department already has a parent. Remove the existing connection first.', variant: 'destructive' });
      return;
    }
    setPendingConnections(prev => { const next = new Map(prev); next.set(params.target!, params.source!); return next; });
    const newEdge: Edge = {
      id: `edge-${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 },
    };
    setEdges(prev => addEdge(newEdge, prev));
  }, [departments, toast, setEdges]);

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    deletedEdges.forEach(edge => {
      setPendingConnections(prev => { const next = new Map(prev); next.delete(edge.target); return next; });
    });
  }, []);

  const saveConnections = useCallback(async () => {
    if (pendingConnections.size === 0) {
      toast({ title: 'No Changes', description: 'No new connections to save' });
      return;
    }
    setIsSaving(true);
    try {
      await Promise.all(Array.from(pendingConnections.entries()).map(async ([childId, parentId]) => {
        const { error } = await db.from('departments').update({ parent_department_id: parentId }).eq('id', childId);
        if (error) throw error;
      }));
      setEdges(prev => prev.map(edge =>
        pendingConnections.has(edge.target)
          ? { ...edge, style: { ...edge.style, strokeDasharray: undefined } }
          : edge
      ));
      toast({ title: 'Success', description: `Saved ${pendingConnections.size} connection(s) successfully` });
      setPendingConnections(new Map());
      onRefresh?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to save connections', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [pendingConnections, db, toast, onRefresh, setEdges]);

  const cancelConnections = useCallback(() => {
    setPendingConnections(new Map());
    setEdges(prev => prev.filter(e => !pendingConnections.has(e.target)));
  }, [pendingConnections, setEdges]);

  return { connectionMode, setConnectionMode, pendingConnections, isSaving, onConnect, onEdgesDelete, saveConnections, cancelConnections };
}
