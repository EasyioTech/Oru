/**
 * Route Groups Configuration
 * Re-exports all route groups for use in AppRoutes
 */

export { PublicRoutes, NonLayoutPublicRoutes, StaticPageRoutes } from "./public";
export { DashboardRoutes } from "./dashboard";
export { EmployeeRoutes, ProjectRoutes, HRRoutes } from "./employeeProjectHr";
export { FinancialRoutes, ClientRoutes, ReportRoutes } from "./financialClientReport";
export { InventoryRoutes } from "./inventoryProcurementAsset";
export { AdminRoutes } from "./admin";
export {
  WorkflowRoutes,
  IntegrationRoutes,
  OtherFeatureRoutes,
} from "./workflowIntegrationQuotationOther";
