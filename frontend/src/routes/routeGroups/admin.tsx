/**
 * Admin Control Plane Routes
 * System administration and platform management
 */

import { Route } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { SuspenseRoute } from "../SuspenseRoute";
import { lazy } from "react";

const AdminDashboard = lazy(() => import("@/modules/admin/pages/Dashboard"));

/**
 * Admin Module Routes
 */
export const AdminRoutes = () => [
  <Route
    key="/admin"
    path="/admin"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <SuspenseRoute>
          <AdminDashboard />
        </SuspenseRoute>
      </ProtectedRoute>
    }
  />,
];
