/**
 * Workflow, Integration, Quotation & Other Feature Routes
 */

import { Route } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

/**
 * Workflows Routes
 */
export const WorkflowRoutes = () => [
  <Route
    key="/workflows"
    path="/workflows"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Workflows /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/workflows/instances"
    path="/workflows/instances"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.WorkflowInstances /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/workflows/approvals"
    path="/workflows/approvals"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.WorkflowApprovals /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/workflows/automation"
    path="/workflows/automation"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.WorkflowAutomation /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/workflows/settings"
    path="/workflows/settings"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.WorkflowSettings /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/workflows/builder"
    path="/workflows/builder"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.WorkflowBuilder /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Integrations Routes
 */
export const IntegrationRoutes = () => [
  <Route
    key="/integrations"
    path="/integrations"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Integrations /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/integrations/settings"
    path="/integrations/settings"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.IntegrationSettings /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Quotations & Job Costing Routes
 */
export const QuotationRoutes = () => [
  <Route
    key="/quotations"
    path="/quotations"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Quotations /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/quotations/new"
    path="/quotations/new"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.QuotationForm /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/quotations/:id"
    path="/quotations/:id"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.QuotationForm /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/jobs"
    path="/jobs"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.JobCosting /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Other Feature Routes
 */
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
    key="/page-requests"
    path="/page-requests"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.PageRequestCenter /></SuspenseRoute>
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
    key="/ai-features"
    path="/ai-features"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.AIFeatures /></SuspenseRoute>
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
      <ProtectedRoute requiredRole="hr">
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
      <ProtectedRoute requiredRole={['super_admin', 'ceo', 'admin']}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AdvancedPermissions /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/advanced-dashboard"
    path="/advanced-dashboard"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AdvancedDashboard /></SuspenseRoute>
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
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ViewAsUser /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];
