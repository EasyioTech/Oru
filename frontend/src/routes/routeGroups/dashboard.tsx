/**
 * Dashboard & Core Routes
 * Agency setup, dashboards, super-admin
 */

import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

/**
 * Dashboard & Core Routes
 */
export const DashboardRoutes = () => [
  <Route
    key="/agency-setup"
    path="/agency-setup"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AgencySetup /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/agency-setup-progress"
    path="/agency-setup-progress"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AgencySetupProgress /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Index /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/agency"
    path="/agency"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AgencyAdminDashboard /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin"
    path="/super-admin"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.SuperAdminDashboardNew /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin/agencies"
    path="/super-admin/agencies"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.AgencyManagement /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin/agencies/:agencyId/data"
    path="/super-admin/agencies/:agencyId/data"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.AgencyDataViewer /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin/system-settings"
    path="/super-admin/system-settings"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.SystemSettings /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin/plans"
    path="/super-admin/plans"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.PlanManagement /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin/page-catalog"
    path="/super-admin/page-catalog"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.PageCatalogManagement /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/super-admin/analytics"
    path="/super-admin/analytics"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.SuperAdminAnalytics /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/system"
    path="/system"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Navigate to="/super-admin" replace />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/system-health"
    path="/system-health"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.SystemHealth /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/system-email"
    path="/system-email"
    element={
      <ProtectedRoute requiredRole="super_admin">
        <Pages.SuperAdminLayout>
          <SuspenseRoute><Pages.SystemEmailPage /></SuspenseRoute>
        </Pages.SuperAdminLayout>
      </ProtectedRoute>
    }
  />,
];
