import { Routes, Route } from "react-router-dom";
import { SuspenseRoute } from "./SuspenseRoute";
import * as Pages from "./lazyImports";
import {
  PublicRoutes,
  NonLayoutPublicRoutes,
  StaticPageRoutes,
  DashboardRoutes,
  EmployeeRoutes,
  ProjectRoutes,
  HRRoutes,
  FinancialRoutes,
  ClientRoutes,
  ReportRoutes,
  AdminRoutes,
  WorkflowRoutes,
  IntegrationRoutes,
  OtherFeatureRoutes,
} from "./routeGroups";

export const AppRoutes = () => (
  <Routes>
    {PublicRoutes()}
    {StaticPageRoutes()}
    {NonLayoutPublicRoutes()}
    {DashboardRoutes()}
    {AdminRoutes()}
    {EmployeeRoutes()}
    {ProjectRoutes()}
    {HRRoutes()}
    {FinancialRoutes()}
    {ClientRoutes()}
    {ReportRoutes()}
    {WorkflowRoutes()}
    {IntegrationRoutes()}
    {OtherFeatureRoutes()}
    <Route path="*" element={<SuspenseRoute><Pages.NotFound /></SuspenseRoute>} />
  </Routes>
);


