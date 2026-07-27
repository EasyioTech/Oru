import React from "react";

// Public/Unauthenticated Pages
export const Landing = React.lazy(() => import("../pages/public"));
export const Auth = React.lazy(() => import("../pages/auth"));
export const SauthLogin = React.lazy(() => import("../pages/auth/sauth-login"));
export const SignupSuccess = React.lazy(() => import("../pages/auth/signup-success"));
export const ForgotPassword = React.lazy(() => import("../pages/auth/forgot-password"));
export const NotFound = React.lazy(() => import("../pages/public/not-found"));
export const OnboardingWizard = React.lazy(() => import("../pages/auth/agency-signup"));
// Dashboard & Core
export const Index = React.lazy(() => import("../pages/dashboards"));
export const AgencyAdminDashboard = React.lazy(() => import("../pages/dashboards/agency-admin"));
export const SuperAdminDashboard = React.lazy(() => import("../pages/dashboards/super-admin"));
export const SuperAdminDashboardNew = React.lazy(() => import("../pages/super-admin/dashboard"));
export const AgencyManagement = React.lazy(() => import("../pages/super-admin/agency-management"));
export const AgencyDataViewer = React.lazy(() => import("../pages/super-admin/agency-data-viewer"));
export const SystemSettings = React.lazy(() => import("../pages/super-admin/system-settings"));
export const PlanManagement = React.lazy(() => import("../pages/super-admin/plan-management"));
export const SuperAdminAnalytics = React.lazy(() => import("../pages/super-admin/analytics"));
export const SuperAdminLayout = React.lazy(() => import("../components/super-admin/SuperAdminLayout").then(m => ({ default: m.SuperAdminLayout })));
export const SystemDashboard = React.lazy(() => import("../pages/dashboards/system"));
export const SystemHealth = React.lazy(() => import("../pages/super-admin/system-health"));
export const SystemEmailPage = React.lazy(() => import("../pages/super-admin/system-email"));

// Employee Management
export const EmployeeManagement = React.lazy(() => import("../pages/employees"));
export const EmployeeDetails = React.lazy(() => import("../pages/employees/employee-details"));
export const CreateEmployee = React.lazy(() => import("../pages/employees/create-employee"));
export const AssignUserRoles = React.lazy(() => import("../pages/employees/assign-user-roles"));
export const EmployeeProjects = React.lazy(() => import("../pages/employees/employee-projects"));
export const EmployeePerformance = React.lazy(() => import("../pages/employees/employee-performance"));
export const MyProfile = React.lazy(() => import("../pages/employees/my-profile"));
export const MyAttendance = React.lazy(() => import("../pages/employees/my-attendance"));
export const MyLeave = React.lazy(() => import("../pages/employees/my-leave"));

// Project Management
export const Projects = React.lazy(() => import("../pages/projects"));
export const ProjectManagement = React.lazy(() => import("../pages/project-management"));
export const ProjectDetails = React.lazy(() => import("../pages/project-details"));
export const TaskDetails = React.lazy(() => import("../pages/project-details/task-details"));

// Settings
export const Settings = React.lazy(() => import("../pages/settings"));

// HR & Attendance
export const Attendance = React.lazy(() => import("../pages/attendance"));
export const LeaveRequests = React.lazy(() => import("../pages/hr/leave-requests"));
export const HolidayManagement = React.lazy(() => import("../pages/hr/holidays"));

// Financial Management
export const Payroll = React.lazy(() => import("../pages/financial/payroll"));
export const Invoices = React.lazy(() => import("../pages/financial/invoices"));
export const Payments = React.lazy(() => import("../pages/financial/payments"));
export const Receipts = React.lazy(() => import("../pages/financial/receipts"));
export const Ledger = React.lazy(() => import("../pages/financial/ledger"));
export const CreateJournalEntry = React.lazy(() => import("../pages/financial/create-journal-entry"));
export const FinancialManagement = React.lazy(() => import("../pages/financial"));
export const Reimbursements = React.lazy(() => import("../pages/financial/reimbursements").then(m => ({ default: m.Reimbursements })));

// Clients & CRM
export const Clients = React.lazy(() => import("../pages/crm/clients"));
export const CreateClient = React.lazy(() => import("../pages/crm/create-client"));
export const CRM = React.lazy(() => import("../pages/crm"));
export const LeadDetail = React.lazy(() => import("../pages/crm/lead-detail"));
export const ActivityDetail = React.lazy(() => import("../pages/crm/activity-detail"));

// Reports
export const Reports = React.lazy(() => import("../pages/reports"));
export const ReportingDashboard = React.lazy(() => import("../pages/reports/reporting-dashboard"));
export const CustomReports = React.lazy(() => import("../pages/reports/custom-reports"));
export const ScheduledReports = React.lazy(() => import("../pages/reports/scheduled-reports"));
export const ReportExports = React.lazy(() => import("../pages/reports/report-exports"));

// Inventory — deferred, module not active in MVP

export const OnboardingPage = React.lazy(() => import('../pages/onboarding'));
export const DepartmentManagement = React.lazy(() => import("../pages/department-management"));
export const Calendar = React.lazy(() => import("../pages/calendar"));
export const Notifications = React.lazy(() => import("../pages/notifications"));
export const ViewAsUser = React.lazy(() => import("../pages/system/view-as-user"));

// Component Modules
export const RoleChangeRequests = React.lazy(() => import('../components/RoleChangeRequests').then(m => ({ default: m.RoleChangeRequests })));
export const AdvancedPermissions = React.lazy(() => import('../components/AdvancedPermissions'));
export const DocumentManager = React.lazy(() => import('../components/documents/DocumentManager').then(m => ({ default: m.DocumentManager })));
