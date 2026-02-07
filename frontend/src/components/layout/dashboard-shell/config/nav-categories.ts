/**
 * Nav category display order, labels, and icon names.
 * Page list comes from rolePages; this config is display-only.
 */

import type { IconComponent } from './icons';
import { getIcon } from './icons';

export type NavCategoryKey =
  | 'dashboard'
  | 'system'
  | 'management'
  | 'hr'
  | 'finance'
  | 'projects'
  | 'inventory'
  | 'procurement'
  | 'assets'
  | 'workflows'
  | 'automation'
  | 'reports'
  | 'personal'
  | 'settings'
  | 'other';

export interface NavCategoryConfig {
  label: string;
  icon: IconComponent;
  color: string;
  order: number;
}

const raw: Record<string, { label: string; icon: string; color: string; order: number }> = {
  dashboard: { label: 'Overview', icon: 'BarChart3', color: 'text-blue-600', order: 1 },
  system: { label: 'System', icon: 'Shield', color: 'text-purple-600', order: 2 },
  management: { label: 'Management', icon: 'Users', color: 'text-green-600', order: 3 },
  hr: { label: 'Human Resources', icon: 'UserCheck', color: 'text-pink-600', order: 4 },
  finance: { label: 'Finance', icon: 'DollarSign', color: 'text-yellow-600', order: 5 },
  projects: { label: 'Projects', icon: 'Briefcase', color: 'text-indigo-600', order: 6 },
  inventory: { label: 'Inventory', icon: 'Package', color: 'text-amber-600', order: 7 },
  procurement: { label: 'Procurement', icon: 'ShoppingCart', color: 'text-teal-600', order: 8 },
  assets: { label: 'Assets', icon: 'Building2', color: 'text-slate-600', order: 9 },
  workflows: { label: 'Workflows', icon: 'Workflow', color: 'text-violet-600', order: 10 },
  automation: { label: 'Automation', icon: 'Zap', color: 'text-rose-600', order: 11 },
  reports: { label: 'Reports & Analytics', icon: 'ChartLine', color: 'text-cyan-600', order: 12 },
  personal: { label: 'Personal', icon: 'User', color: 'text-orange-600', order: 13 },
  settings: { label: 'Settings', icon: 'Settings', color: 'text-muted-foreground', order: 14 },
  other: { label: 'Other', icon: 'FileText', color: 'text-muted-foreground', order: 99 },
};

export const navCategoryConfig: Record<string, NavCategoryConfig> = Object.fromEntries(
  Object.entries(raw).map(([key, val]) => [
    key,
    { ...val, icon: getIcon(val.icon) },
  ])
);

export function getCategoryOrder(category: string): number {
  return navCategoryConfig[category]?.order ?? 99;
}

export function getCategoryConfig(category: string): NavCategoryConfig | undefined {
  return navCategoryConfig[category];
}
