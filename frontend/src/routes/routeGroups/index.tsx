/**
 * Route Groups Configuration
 * Re-exports all route groups for use in AppRoutes
 */

export { PublicRoutes, StaticPageRoutes } from "./public";
export { DashboardRoutes } from "./dashboard";
export { EmployeeRoutes, ProjectRoutes, HRRoutes } from "./employeeProjectHr";
export { FinancialRoutes, ClientRoutes, ReportRoutes } from "./financialClientReport";
export { InventoryRoutes, ProcurementRoutes, AssetRoutes } from "./inventoryProcurementAsset";
export {
  WorkflowRoutes,
  IntegrationRoutes,
  QuotationRoutes,
  OtherFeatureRoutes,
} from "./workflowIntegrationQuotationOther";
