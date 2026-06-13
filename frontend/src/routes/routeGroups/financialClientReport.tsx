/**
 * Financial, Client & Report Routes
 */

import { Route } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

/**
 * Financial Management Routes
 */
export const FinancialRoutes = () => [
  <Route
    key="/payroll"
    path="/payroll"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Payroll /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/invoices"
    path="/invoices"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Invoices /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/payments"
    path="/payments"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Payments /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/receipts"
    path="/receipts"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Receipts /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/ledger"
    path="/ledger"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Ledger /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/ledger/create-entry"
    path="/ledger/create-entry"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CreateJournalEntry /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/financial-management"
    path="/financial-management"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.FinancialManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/gst-compliance"
    path="/gst-compliance"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.GstCompliance /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reimbursements"
    path="/reimbursements"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Reimbursements /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Clients & CRM Routes
 */
export const ClientRoutes = () => [
  <Route
    key="/clients"
    path="/clients"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.Clients /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/clients/create"
    path="/clients/create"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CreateClient /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/clients/edit/:id"
    path="/clients/edit/:id"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CreateClient /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/crm"
    path="/crm"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CRM /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/crm/leads/:leadId"
    path="/crm/leads/:leadId"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.LeadDetail /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/crm/activities/:activityId"
    path="/crm/activities/:activityId"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin", "manager"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ActivityDetail /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Reports & Analytics Routes
 */
export const ReportRoutes = () => [
  <Route
    key="/reports"
    path="/reports"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Reports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reports/dashboard"
    path="/reports/dashboard"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ReportingDashboard /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reports/custom"
    path="/reports/custom"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CustomReports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reports/scheduled"
    path="/reports/scheduled"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ScheduledReports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reports/exports"
    path="/reports/exports"
    element={
      <ProtectedRoute requiredRole={["agency_admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ReportExports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];
