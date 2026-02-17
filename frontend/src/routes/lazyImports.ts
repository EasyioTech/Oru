/**
 * Lazy-loaded page component imports
 * Organized by feature/module for better maintainability
 */

import React from "react";

// Public/Unauthenticated Pages
export const Landing = React.lazy(() => import("../pages/public"));
export const Pricing = React.lazy(() => import("../pages/public/pricing"));
export const Auth = React.lazy(() => import("../pages/auth"));
export const SauthLogin = React.lazy(() => import("../pages/auth/sauth-login"));
export const SignupSuccess = React.lazy(() => import("../pages/auth/signup-success"));
export const ForgotPassword = React.lazy(() => import("../pages/auth/forgot-password"));
export const NotFound = React.lazy(() => import("../pages/public/not-found"));
export const OnboardingWizard = React.lazy(() => import("../components/onboarding/OnboardingWizard"));

// Static Pages (split for performance - each loads independently)
export const ContactPage = React.lazy(() => import("../pages/static-pages/contact"));
export const AboutPage = React.lazy(() => import("../pages/static-pages/about"));
export const BlogPage = React.lazy(() => import("../pages/static-pages/blog"));
export const CareersPage = React.lazy(() => import("../pages/static-pages/careers"));
export const HelpCenterPage = React.lazy(() => import("../pages/static-pages/help-center"));
export const DocsPage = React.lazy(() => import("../pages/static-pages/docs"));
export const APIReferencePage = React.lazy(() => import("../pages/static-pages/api-reference"));
export const PrivacyPolicyPage = React.lazy(() => import("../pages/static-pages/privacy"));
export const TermsPage = React.lazy(() => import("../pages/static-pages/terms"));
export const CookiePolicyPage = React.lazy(() => import("../pages/static-pages/cookies"));
export const GDPRPage = React.lazy(() => import("../pages/static-pages/gdpr"));
export const ChangelogPage = React.lazy(() => import("../pages/static-pages/changelog"));
export const RoadmapPage = React.lazy(() => import("../pages/static-pages/roadmap"));
export const IntegrationsPublicPage = React.lazy(() => import("../pages/static-pages/integrations-info"));
export const TemplatesPage = React.lazy(() => import("../pages/static-pages/templates"));
export const CommunityPage = React.lazy(() => import("../pages/static-pages/community"));
export const PressPage = React.lazy(() => import("../pages/static-pages/press"));

// Dashboard & Core
export const Index = React.lazy(() => import("../pages/dashboards"));
export const AgencyDashboard = React.lazy(() => import("../pages/dashboards/agency"));
export const AgencyAdminDashboard = React.lazy(() => import("../pages/dashboards/agency-admin"));
export const AgencySetup = React.lazy(() => import("../pages/agency-setup"));
export const AgencySetupProgress = React.lazy(() => import("../pages/agency-setup/agency-setup-progress"));
export const SuperAdminDashboard = React.lazy(() => import("../pages/dashboards/super-admin"));
export const SuperAdminDashboardNew = React.lazy(() => import("../pages/super-admin/SuperAdminDashboard"));
export const AgencyManagement = React.lazy(() => import("../pages/super-admin/AgencyManagement"));
export const AgencyDataViewer = React.lazy(() => import("../pages/super-admin/AgencyDataViewer"));
export const SystemSettings = React.lazy(() => import("../pages/super-admin/SystemSettings"));
export const PlanManagement = React.lazy(() => import("../pages/super-admin/PlanManagement"));
export const PageCatalogManagement = React.lazy(() => import("../pages/super-admin/PageCatalogManagement"));
export const SuperAdminAnalytics = React.lazy(() => import("../pages/super-admin/Analytics"));
export const SuperAdminLayout = React.lazy(() => import("../components/super-admin/SuperAdminLayout").then(m => ({ default: m.SuperAdminLayout })));
export const SystemDashboard = React.lazy(() => import("../pages/dashboards/system"));
export const SystemHealth = React.lazy(() => import("../pages/super-admin/SystemHealth"));

// Employee Management
export const EmployeeManagement = React.lazy(() => import("../pages/employees"));
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
export const GstCompliance = React.lazy(() => import("../pages/financial/gst-compliance"));
export const Reimbursements = React.lazy(() => import("../pages/financial/reimbursements").then(m => ({ default: m.Reimbursements })));

// Clients & CRM
export const Clients = React.lazy(() => import("../pages/crm/clients"));
export const CreateClient = React.lazy(() => import("../pages/crm/create-client"));
export const CRM = React.lazy(() => import("../pages/crm"));
export const LeadDetail = React.lazy(() => import("../pages/crm/lead-detail"));
export const ActivityDetail = React.lazy(() => import("../pages/crm/activity-detail"));

// Reports & Analytics
export const Reports = React.lazy(() => import("../pages/reports"));
export const Analytics = React.lazy(() => import("../pages/analytics"));
export const CentralizedReports = React.lazy(() => import("../pages/centralized-reports"));
export const ReportingDashboard = React.lazy(() => import("../pages/reports/reporting-dashboard"));
export const CustomReports = React.lazy(() => import("../pages/reports/custom-reports"));
export const ScheduledReports = React.lazy(() => import("../pages/reports/scheduled-reports"));
export const ReportExports = React.lazy(() => import("../pages/reports/report-exports"));
export const AnalyticsDashboard = React.lazy(() => import("../pages/analytics/dashboard"));

// Inventory
export const InventoryManagement = React.lazy(() => import("../pages/inventory"));
export const InventoryProducts = React.lazy(() => import("../pages/inventory/products"));
export const InventoryBOM = React.lazy(() => import("../pages/inventory/bom"));
export const InventorySerialBatch = React.lazy(() => import("../pages/inventory/serial-batch"));
export const InventoryReports = React.lazy(() => import("../pages/inventory/reports"));
export const InventorySettings = React.lazy(() => import("../pages/inventory/settings"));
export const InventoryWarehouses = React.lazy(() => import("../pages/inventory/warehouses"));
export const InventoryStockLevels = React.lazy(() => import("../pages/inventory/stock-levels"));
export const InventoryTransfers = React.lazy(() => import("../pages/inventory/transfers"));
export const InventoryAdjustments = React.lazy(() => import("../pages/inventory/adjustments"));

// Procurement
export const ProcurementManagement = React.lazy(() => import("../pages/procurement"));
export const ProcurementVendors = React.lazy(() => import("../pages/procurement/vendors"));
export const ProcurementPurchaseOrders = React.lazy(() => import("../pages/procurement/purchase-orders"));
export const ProcurementRequisitions = React.lazy(() => import("../pages/procurement/requisitions"));
export const ProcurementGoodsReceipts = React.lazy(() => import("../pages/procurement/goods-receipts"));
export const ProcurementRFQ = React.lazy(() => import("../pages/procurement/rfq"));
export const ProcurementVendorContracts = React.lazy(() => import("../pages/procurement/vendor-contracts"));
export const ProcurementVendorPerformance = React.lazy(() => import("../pages/procurement/vendor-performance"));
export const ProcurementReports = React.lazy(() => import("../pages/procurement/reports"));
export const ProcurementSettings = React.lazy(() => import("../pages/procurement/settings"));

// Assets
export const Assets = React.lazy(() => import("../pages/assets"));
export const AssetCategories = React.lazy(() => import("../pages/assets/categories"));
export const AssetLocations = React.lazy(() => import("../pages/assets/locations"));
export const AssetMaintenance = React.lazy(() => import("../pages/assets/maintenance"));
export const AssetDepreciation = React.lazy(() => import("../pages/assets/depreciation"));
export const AssetDisposals = React.lazy(() => import("../pages/assets/disposals"));
export const AssetReports = React.lazy(() => import("../pages/assets/reports"));
export const AssetSettings = React.lazy(() => import("../pages/assets/settings"));

// Workflows
export const Workflows = React.lazy(() => import("../pages/workflows"));
export const WorkflowInstances = React.lazy(() => import("../pages/workflows/instances"));
export const WorkflowBuilder = React.lazy(() => import("../pages/workflows/builder"));
export const WorkflowApprovals = React.lazy(() => import("../pages/workflows/approvals"));
export const WorkflowAutomation = React.lazy(() => import("../pages/workflows/automation"));
export const WorkflowSettings = React.lazy(() => import("../pages/workflows/settings"));

// Integrations
export const Integrations = React.lazy(() => import("../pages/integrations"));
export const IntegrationSettings = React.lazy(() => import("../pages/integrations/settings"));

// Quotations & Job Costing
export const Quotations = React.lazy(() => import("../pages/quotations"));
export const QuotationForm = React.lazy(() => import("../pages/quotations/form"));
export const JobCosting = React.lazy(() => import("../pages/job-costing"));

// Other Features
export const DepartmentManagement = React.lazy(() => import("../pages/department-management"));
export const AIFeatures = React.lazy(() => import("../pages/ai-features"));
export const Calendar = React.lazy(() => import("../pages/calendar"));
export const Notifications = React.lazy(() => import("../pages/notifications"));
export const PageRequestCenter = React.lazy(() => import("../pages/system/page-request-center"));
export const SystemEmailPage = React.lazy(() => import("../pages/super-admin/SystemEmail"));
export const ViewAsUser = React.lazy(() => import("../pages/system/view-as-user"));

// Component Modules
export const RoleChangeRequests = React.lazy(() => import('../components/RoleChangeRequests').then(m => ({ default: m.RoleChangeRequests })));
export const AdvancedPermissions = React.lazy(() => import('../components/AdvancedPermissions'));
export const AdvancedDashboard = React.lazy(() => import('../components/analytics/AdvancedDashboard').then(m => ({ default: m.AdvancedDashboard })));
export const DocumentManager = React.lazy(() => import('../components/documents/DocumentManager').then(m => ({ default: m.DocumentManager })));

