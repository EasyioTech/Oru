import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const AdminDashboard = lazy(() => import('./pages/Dashboard'));

const routes: RouteObject[] = [
  {
    index: true,
    element: <AdminDashboard />,
  },
];

export default routes;
