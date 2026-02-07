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
      <ProtectedRoute requiredRole={["admin", "super_admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin", "finance_manager", "ceo", "cfo"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin", "finance_manager", "cfo"]}>
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
      <ProtectedRoute requiredRole="sales_manager">
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
      <ProtectedRoute requiredRole="sales_manager">
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
      <ProtectedRoute requiredRole={["hr", "super_admin"]}>
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
      <ProtectedRoute requiredRole="hr">
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
      <ProtectedRoute requiredRole={["hr", "super_admin"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Reports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/analytics"
    path="/analytics"
    element={
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <SuspenseRoute><Pages.Analytics /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/centralized-reports"
    path="/centralized-reports"
    element={
      <ProtectedRoute requiredRole={["admin", "finance_manager", "cfo", "ceo"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CentralizedReports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reports/dashboard"
    path="/reports/dashboard"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
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
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ReportExports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/reports/analytics"
    path="/reports/analytics"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AnalyticsDashboard /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];
