import { Edge, MarkerType } from 'reactflow';
import type { Department } from './types';

const HORIZONTAL_SPACING = 200;
const VERTICAL_SPACING = 180;
const START_Y = 50;
const CARD_WIDTH = 220;

export function buildChildrenMap(filteredDepartments: Department[]): Map<string, Department[]> {
  const map = new Map<string, Department[]>();
  filteredDepartments.forEach(dept => {
    if (dept.parent_department_id?.trim()) {
      const parentId = dept.parent_department_id!;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)!.push(dept);
    }
  });
  return map;
}

export function buildParentMap(filteredDepartments: Department[]): Map<string, string> {
  const map = new Map<string, string>();
  filteredDepartments.forEach(dept => {
    if (dept.parent_department_id?.trim()) map.set(dept.id, dept.parent_department_id!);
  });
  return map;
}

export function getLevel(
  deptId: string,
  parentMap: Map<string, string>,
  filteredDepts: Department[],
  visited = new Set<string>(),
): number {
  if (visited.has(deptId)) return 0;
  visited.add(deptId);
  const parentId = parentMap.get(deptId);
  if (!parentId || !filteredDepts.some(d => d.id === parentId)) return 0;
  return getLevel(parentId, parentMap, filteredDepts, new Set(visited)) + 1;
}

export function buildLayoutPositions(filteredDepartments: Department[]): Map<string, { x: number; y: number }> {
  const parentMap = buildParentMap(filteredDepartments);
  const levelMap = new Map<number, Department[]>();
  filteredDepartments.forEach(dept => {
    const level = getLevel(dept.id, parentMap, filteredDepartments);
    if (!levelMap.has(level)) levelMap.set(level, []);
    levelMap.get(level)!.push(dept);
  });
  const positions = new Map<string, { x: number; y: number }>();
  if (levelMap.size === 0) return positions;
  const maxLevel = Math.max(...Array.from(levelMap.keys()));
  for (let level = 0; level <= maxLevel; level++) {
    const levelDepts = levelMap.get(level) || [];
    const levelWidth = levelDepts.length * (CARD_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
    let currentX = -levelWidth / 2;
    levelDepts.forEach(dept => {
      positions.set(dept.id, { x: currentX, y: START_Y + level * VERTICAL_SPACING });
      currentX += CARD_WIDTH + HORIZONTAL_SPACING;
    });
  }
  return positions;
}

export function buildHierarchyEdges(filteredDepartments: Department[]): Edge[] {
  return filteredDepartments
    .filter(dept => dept.parent_department_id?.trim() && filteredDepartments.some(d => d.id === dept.parent_department_id))
    .map(dept => ({
      id: `edge-${dept.parent_department_id}-${dept.id}`,
      source: dept.parent_department_id!,
      target: dept.id,
      type: 'smoothstep' as const,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 },
    }));
}
