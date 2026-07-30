import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, Node, Position } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { buildChildrenMap, buildParentMap, getLevel, buildLayoutPositions, buildHierarchyEdges } from './hierarchyLayout';
import { computeStats, exportHierarchyDocument } from './hierarchyUtils';
import { useHierarchyConnections } from './useHierarchyConnections';
import type { Department, DepartmentMember, DepartmentHierarchyViewProps } from './types';

export function useDepartmentHierarchy({
  departments,
  expandedDepartments,
  setExpandedDepartments,
  departmentMembers,
  setDepartmentMembers,
  onDepartmentClick,
  db,
  onRefresh,
}: DepartmentHierarchyViewProps) {
  const { toast } = useToast();
  const reactFlowInstance = useRef<any>(null);
  const [loadingMembers, setLoadingMembers] = useState<Set<string>>(new Set());
  const [lockedNodes, setLockedNodes] = useState<Set<string>>(new Set());
  const [showInactiveDepartments, setShowInactiveDepartments] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManager, setFilterManager] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const connections = useHierarchyConnections({ departments, toast, db, onRefresh, setEdges });

  const filteredDepartments = useMemo(() => {
    let filtered = showInactiveDepartments ? departments : departments.filter(d => d.is_active);
    if (searchTerm.trim()) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.manager?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterManager !== 'all') filtered = filtered.filter(dept => dept.manager_id === filterManager);
    return filtered;
  }, [departments, showInactiveDepartments, searchTerm, filterManager]);

  const fetchDepartmentMembers = useCallback(async (departmentId: string) => {
    if (departmentMembers[departmentId]) return;
    setLoadingMembers(prev => new Set(prev).add(departmentId));
    try {
      const { data: assignmentsData, error: assignmentsError } = await db
        .from('team_assignments').select('id, user_id, position_title, role_in_department')
        .eq('department_id', departmentId).eq('is_active', true);
      if (assignmentsError) throw assignmentsError;
      if (!assignmentsData || assignmentsData.length === 0) {
        setDepartmentMembers((prev: Record<string, DepartmentMember[]>) => ({ ...prev, [departmentId]: [] }));
        return;
      }
      const userIds = assignmentsData.map((ta: any) => ta.user_id);
      const { data: profilesData, error: profilesError } = await db.from('profiles').select('user_id, full_name').in('user_id', userIds);
      if (profilesError) throw profilesError;
      const profileMap = new Map((profilesData || []).map((p: any) => [p.user_id, p.full_name]));
      const members: DepartmentMember[] = assignmentsData.map((ta: any) => ({
        id: ta.id, full_name: profileMap.get(ta.user_id) || 'Unknown',
        position_title: ta.position_title, role_in_department: ta.role_in_department,
      }));
      setDepartmentMembers((prev: Record<string, DepartmentMember[]>) => ({ ...prev, [departmentId]: members }));
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch department members', variant: 'destructive' });
    } finally {
      setLoadingMembers(prev => { const next = new Set(prev); next.delete(departmentId); return next; });
    }
  }, [departmentMembers, db, toast, setDepartmentMembers]);

  const buildHierarchy = useCallback(() => {
    if (filteredDepartments.length === 0) { setNodes([]); setEdges([]); return; }
    const childrenMap = buildChildrenMap(filteredDepartments);
    const parentMap = buildParentMap(filteredDepartments);
    const positions = buildLayoutPositions(filteredDepartments);
    const newNodes: Node[] = filteredDepartments.map(dept => ({
      id: dept.id,
      type: 'department',
      position: positions.get(dept.id) || { x: 0, y: 0 },
      data: {
        dept,
        level: getLevel(dept.id, parentMap, filteredDepartments),
        onDepartmentClick,
        onExpand: (id: string) => setExpandedDepartments(prev => {
          const next = new Set(prev);
          if (next.has(id)) { next.delete(id); } else { next.add(id); fetchDepartmentMembers(id); }
          return next;
        }),
        isExpanded: expandedDepartments.has(dept.id),
        hasChildren: childrenMap.has(dept.id),
        members: departmentMembers[dept.id] || [],
        isLoading: loadingMembers.has(dept.id),
        isLocked: lockedNodes.has(dept.id),
        onToggleLock: (id: string) => setLockedNodes(prev => {
          const next = new Set(prev);
          if (next.has(id)) { next.delete(id); } else { next.add(id); }
          return next;
        }),
        connectionMode: connections.connectionMode,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      draggable: !lockedNodes.has(dept.id),
    }));
    setNodes(newNodes);
    setEdges(buildHierarchyEdges(filteredDepartments));
  }, [filteredDepartments, expandedDepartments, departmentMembers, loadingMembers, lockedNodes, connections.connectionMode, onDepartmentClick, setExpandedDepartments, fetchDepartmentMembers, setNodes, setEdges]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (departments.length > 0 && expandedDepartments.size === 0) setExpandedDepartments(new Set(departments.map(d => d.id))); }, [departments, expandedDepartments.size]);
   
  useEffect(() => { buildHierarchy(); }, [buildHierarchy]);

  const stats = useMemo(() => computeStats(departments), [departments]);
  const managers = useMemo(() => {
    const unique = new Map<string, string>();
    departments.filter(d => d.manager_id && d.manager).forEach(d => unique.set(d.manager_id!, d.manager!.full_name));
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [departments]);

  const hasRootDepartments = filteredDepartments.some(
    d => (!d.parent_department_id || d.parent_department_id.trim() === '') || !filteredDepartments.some(p => p.id === d.parent_department_id)
  );

  const handleZoomIn = () => { reactFlowInstance.current?.zoomIn(); setZoomLevel(prev => Math.min(prev + 0.1, 2)); };
  const handleZoomOut = () => { reactFlowInstance.current?.zoomOut(); setZoomLevel(prev => Math.max(prev - 0.1, 0.1)); };
  const handleFitView = () => { reactFlowInstance.current?.fitView({ padding: 0.3, duration: 400 }); setZoomLevel(1); };
  const handleExport = useCallback(() => exportHierarchyDocument(departments, stats, toast), [departments, stats, toast]);

  return {
    nodes, edges, onNodesChange, onEdgesChange,
    reactFlowInstance, filteredDepartments,
    searchTerm, setSearchTerm, filterManager, setFilterManager,
    showInactiveDepartments, setShowInactiveDepartments,
    showStats, setShowStats, zoomLevel, setZoomLevel,
    stats, managers, hasRootDepartments,
    buildHierarchy, handleZoomIn, handleZoomOut, handleFitView, handleExport,
    ...connections,
  };
}

export type UseDepartmentHierarchyReturn = ReturnType<typeof useDepartmentHierarchy>;
