import type { Department } from './types';

type ToastFn = (opts: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;

export interface DeptStats {
  total: number;
  active: number;
  inactive: number;
  withManager: number;
  rootDepartments: number;
  totalEmployees: number;
  totalBudget: number;
}

export function computeStats(departments: Department[]): DeptStats {
  return {
    total: departments.length,
    active: departments.filter(d => d.is_active).length,
    inactive: departments.filter(d => !d.is_active).length,
    withManager: departments.filter(d => d.manager_id).length,
    rootDepartments: departments.filter(d => !d.parent_department_id || d.parent_department_id.trim() === '').length,
    totalEmployees: departments.reduce((sum, d) => sum + (d._count?.team_assignments || 0), 0),
    totalBudget: departments.reduce((sum, d) => sum + (d.budget || 0), 0),
  };
}

export function exportHierarchyDocument(departments: Department[], stats: DeptStats, toast: ToastFn): void {
  const lines: string[] = [];
  lines.push('='.repeat(60));
  lines.push('DEPARTMENT HIERARCHY STRUCTURE');
  lines.push('='.repeat(60));
  lines.push(`Generated on: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('DETAILED RELATIONSHIPS:');
  lines.push('-'.repeat(60));
  lines.push('');
  departments.forEach(dept => {
    if (dept.parent_department_id?.trim()) {
      const parent = departments.find(p => p.id === dept.parent_department_id);
      if (parent) lines.push(`• ${dept.name} is under ${parent.name}`);
    } else {
      lines.push(`• ${dept.name} (Root Department - No Parent)`);
    }
  });
  lines.push('');
  lines.push('-'.repeat(60));
  lines.push('STATISTICS:');
  lines.push('-'.repeat(60));
  lines.push(`Total Departments: ${stats.total}`);
  lines.push(`Active Departments: ${stats.active}`);
  lines.push(`Root Departments: ${stats.rootDepartments}`);
  lines.push(`Total Employees: ${stats.totalEmployees}`);
  lines.push('='.repeat(60));
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `department-hierarchy-${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Success', description: 'Hierarchy document exported successfully' });
}
