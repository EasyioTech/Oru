import { canAccessRouteSync } from './routePermissions';
import type { AppRole } from './roleUtils';

export interface PageConfig {
  path: string;
  title: string;
  icon: string;
  category: string;
  exists: boolean;
}

const NAV_PAGES: PageConfig[] = [
  // Dashboard
  { path: '/dashboard', title: 'Dashboard', icon: 'LayoutDashboard', category: 'dashboard', exists: true },

  // System
  { path: '/view-as-user', title: 'View As User', icon: 'Eye', category: 'system', exists: true },
  { path: '/permissions', title: 'Permissions', icon: 'Shield', category: 'system', exists: true },

  // Management
  { path: '/employee-management', title: 'Employees', icon: 'Users', category: 'management', exists: true },
  { path: '/department-management', title: 'Departments', icon: 'GitBranch', category: 'management', exists: true },
  { path: '/assign-user-roles', title: 'User Roles', icon: 'UserCog', category: 'management', exists: true },
  { path: '/clients', title: 'Clients', icon: 'Handshake', category: 'management', exists: true },
  { path: '/crm', title: 'CRM', icon: 'Target', category: 'management', exists: true },

  // Projects
  { path: '/projects', title: 'Projects', icon: 'Briefcase', category: 'projects', exists: true },
  { path: '/my-projects', title: 'My Projects', icon: 'FolderKanban', category: 'projects', exists: true },

  // HR
  { path: '/attendance', title: 'Attendance', icon: 'Clock', category: 'hr', exists: true },
  { path: '/leave-requests', title: 'Leave Requests', icon: 'CalendarDays', category: 'hr', exists: true },
  { path: '/holiday-management', title: 'Holidays', icon: 'Calendar', category: 'hr', exists: true },
  { path: '/role-requests', title: 'Role Requests', icon: 'UserCog', category: 'hr', exists: true },
  { path: '/employee-performance', title: 'Performance', icon: 'TrendingUp', category: 'hr', exists: true },

  // Finance
  { path: '/financial-management', title: 'Finance', icon: 'DollarSign', category: 'finance', exists: true },
  { path: '/payroll', title: 'Payroll', icon: 'CreditCard', category: 'finance', exists: true },
  { path: '/invoices', title: 'Invoices', icon: 'Receipt', category: 'finance', exists: true },
  { path: '/payments', title: 'Payments', icon: 'FileCheck', category: 'finance', exists: true },
  { path: '/receipts', title: 'Receipts', icon: 'FileText', category: 'finance', exists: true },
  { path: '/ledger', title: 'General Ledger', icon: 'BookOpen', category: 'finance', exists: true },
  { path: '/reimbursements', title: 'Reimbursements', icon: 'ArrowRightLeft', category: 'finance', exists: true },

  // Reports
  { path: '/reports', title: 'Reports', icon: 'BarChart3', category: 'reports', exists: true },
  { path: '/centralized-reports', title: 'Centralized Reports', icon: 'ChartLine', category: 'reports', exists: true },

  // Inventory
  { path: '/inventory', title: 'Inventory', icon: 'Package', category: 'inventory', exists: true },
  { path: '/inventory/products', title: 'Products', icon: 'Boxes', category: 'inventory', exists: true },
  { path: '/inventory/warehouses', title: 'Warehouses', icon: 'Warehouse', category: 'inventory', exists: true },
  { path: '/inventory/stock-levels', title: 'Stock Levels', icon: 'Activity', category: 'inventory', exists: true },
  { path: '/inventory/transfers', title: 'Transfers', icon: 'ArrowRightLeft', category: 'inventory', exists: true },

  // Workflows
  { path: '/workflows', title: 'Workflows', icon: 'Workflow', category: 'workflows', exists: true },
  { path: '/integrations', title: 'Integrations', icon: 'Plug', category: 'workflows', exists: true },

  // Personal
  { path: '/calendar', title: 'Calendar', icon: 'Calendar', category: 'personal', exists: true },
  { path: '/my-profile', title: 'My Profile', icon: 'User', category: 'personal', exists: true },
  { path: '/my-attendance', title: 'My Attendance', icon: 'Clock', category: 'personal', exists: true },
  { path: '/my-leave', title: 'My Leave', icon: 'CalendarDays', category: 'personal', exists: true },
  { path: '/notifications', title: 'Notifications', icon: 'Bell', category: 'personal', exists: true },
  { path: '/documents', title: 'Documents', icon: 'FileText', category: 'personal', exists: true },
  { path: '/ai-features', title: 'AI Features', icon: 'Zap', category: 'personal', exists: true },

  // Settings
  { path: '/settings', title: 'Settings', icon: 'Settings', category: 'settings', exists: true },
];

export function getPagesForRole(role: AppRole): PageConfig[] {
  return NAV_PAGES.filter(page => canAccessRouteSync(role, page.path));
}
