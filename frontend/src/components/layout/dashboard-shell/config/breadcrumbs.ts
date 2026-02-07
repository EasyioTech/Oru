/**
 * Route to breadcrumb mapping and path-based derivation.
 */

export interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeMap: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ label: 'Dashboard', path: '/dashboard' }],
  '/super-admin': [{ label: 'Super Admin', path: '/super-admin' }],
  '/employees': [{ label: 'Employees', path: '/employees' }],
  '/employee-management': [{ label: 'Employee Management', path: '/employee-management' }],
  '/projects': [{ label: 'Projects', path: '/projects' }],
  '/attendance': [{ label: 'Attendance', path: '/attendance' }],
  '/payroll': [{ label: 'Payroll', path: '/payroll' }],
  '/settings': [{ label: 'Settings', path: '/settings' }],
  '/clients': [{ label: 'Clients', path: '/clients' }],
  '/crm': [{ label: 'CRM', path: '/crm' }],
  '/financial-management': [{ label: 'Financial Management', path: '/financial-management' }],
  '/reports': [{ label: 'Reports', path: '/reports' }],
  '/analytics': [{ label: 'Analytics', path: '/analytics' }],
  '/department-management': [{ label: 'Department Management', path: '/department-management' }],
  '/my-profile': [{ label: 'My Profile', path: '/my-profile' }],
  '/notifications': [{ label: 'Notifications', path: '/notifications' }],
  '/system-dashboard': [{ label: 'System Dashboard', path: '/system-dashboard' }],
};

/**
 * Derive breadcrumbs from pathname.
 * Uses routeMap when exact path matches; otherwise builds from path segments.
 */
export function getBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  if (routeMap[pathname]) {
    if (pathname === '/dashboard') {
      return routeMap[pathname];
    }
    return [{ label: 'Home', path: '/dashboard' }, ...routeMap[pathname]];
  }

  const crumbs: BreadcrumbItem[] = [];
  if (pathname !== '/dashboard') {
    crumbs.push({ label: 'Home', path: '/dashboard' });
  }

  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    if (currentPath !== '/dashboard' || crumbs.length === 0) {
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      crumbs.push({ label, path: currentPath });
    }
  }

  return crumbs;
}

export { routeMap };
