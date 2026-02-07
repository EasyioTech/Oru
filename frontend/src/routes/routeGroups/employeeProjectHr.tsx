/**
 * Employee, Project & HR Routes
 */

import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

/**
 * Employee Management Routes
 */
export const EmployeeRoutes = () => [
  <Route
    key="/employee-management"
    path="/employee-management"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin", "hr", "ceo", "cto", "cfo", "coo", "department_head"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.EmployeeManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route key="/my-team" path="/my-team" element={<Navigate to="/employee-management" replace />} />,
  <Route key="/users" path="/users" element={<Navigate to="/employee-management" replace />} />,
  <Route key="/employees" path="/employees" element={<Navigate to="/employee-management" replace />} />,
  <Route
    key="/create-employee"
    path="/create-employee"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin", "hr", "ceo", "cto", "cfo", "coo", "department_head"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.CreateEmployee /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assign-user-roles"
    path="/assign-user-roles"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin", "ceo"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssignUserRoles /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/my-projects"
    path="/my-projects"
    element={
      <ProtectedRoute requiredRole="employee">
        <DashboardLayout>
          <SuspenseRoute><Pages.EmployeeProjects /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/employee-performance"
    path="/employee-performance"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.EmployeePerformance /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/my-profile"
    path="/my-profile"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.MyProfile /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/my-attendance"
    path="/my-attendance"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.MyAttendance /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/my-leave"
    path="/my-leave"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.MyLeave /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Project Management Routes
 */
export const ProjectRoutes = () => [
  <Route
    key="/project-management"
    path="/project-management"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProjectManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/projects/:id"
    path="/projects/:id"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProjectDetails /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/tasks/:id"
    path="/tasks/:id"
    element={
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseRoute><Pages.TaskDetails /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/projects"
    path="/projects"
    element={
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <SuspenseRoute><Pages.Projects /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * HR & Attendance Routes
 */
export const HRRoutes = () => [
  <Route
    key="/attendance"
    path="/attendance"
    element={
      <ProtectedRoute requiredRole={["hr", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Attendance /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/leave-requests"
    path="/leave-requests"
    element={
      <ProtectedRoute requiredRole="hr">
        <DashboardLayout>
          <SuspenseRoute><Pages.LeaveRequests /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/holiday-management"
    path="/holiday-management"
    element={
      <ProtectedRoute requiredRole={["hr", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.HolidayManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];
