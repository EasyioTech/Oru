/**
 * Command palette items (navigation shortcuts).
 * Icon names resolve via config/icons.ts.
 */

export interface CommandPaletteItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  shortcut?: string;
}

export const commandPaletteItems: CommandPaletteItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', iconName: 'Home', shortcut: '⌘D' },
  { id: 'employees', label: 'Employees', path: '/employees', iconName: 'Users', shortcut: '⌘E' },
  { id: 'projects', label: 'Projects', path: '/projects', iconName: 'Briefcase', shortcut: '⌘P' },
  { id: 'attendance', label: 'Attendance', path: '/attendance', iconName: 'Calendar', shortcut: '⌘A' },
  { id: 'payroll', label: 'Payroll', path: '/payroll', iconName: 'DollarSign', shortcut: '⌘Y' },
  { id: 'clients', label: 'Clients', path: '/clients', iconName: 'Users', shortcut: '⌘C' },
  { id: 'crm', label: 'CRM', path: '/crm', iconName: 'Briefcase', shortcut: '⌘R' },
  { id: 'financial', label: 'Financial Management', path: '/financial-management', iconName: 'DollarSign', shortcut: '⌘F' },
  { id: 'reports', label: 'Reports', path: '/reports', iconName: 'FileText', shortcut: '⌘T' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', iconName: 'BarChart3', shortcut: '⌘N' },
  { id: 'settings', label: 'Settings', path: '/settings', iconName: 'Settings', shortcut: '⌘S' },
  { id: 'profile', label: 'My Profile', path: '/my-profile', iconName: 'User', shortcut: '⌘M' },
];
