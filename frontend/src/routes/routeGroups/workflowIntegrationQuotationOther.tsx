import { Route } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

export const WorkflowRoutes = () => [];
export const IntegrationRoutes = () => [];

export const QuotationRoutes = () => [];

export const OtherFeatureRoutes = () => [
  <Route
    key="/settings"
    path="/settings"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Settings /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/department-management"
    path="/department-management"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.DepartmentManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/calendar"
    path="/calendar"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Calendar /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/notifications"
    path="/notifications"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Notifications /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/role-requests"
    path="/role-requests"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.RoleChangeRequests /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/permissions"
    path="/permissions"
    element={
      <ProtectedRoute requiredRole={['super_admin', 'agency_admin']}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AdvancedPermissions /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/documents"
    path="/documents"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.DocumentManager /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/view-as-user"
    path="/view-as-user"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ViewAsUser /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];
