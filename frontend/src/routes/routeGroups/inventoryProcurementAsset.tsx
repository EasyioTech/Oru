/**
 * Inventory, Procurement & Asset Routes
 */

import { Route } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

/**
 * Inventory Routes
 */
export const InventoryRoutes = () => [
  <Route
    key="/inventory"
    path="/inventory"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/products"
    path="/inventory/products"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryProducts /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/bom"
    path="/inventory/bom"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryBOM /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/serial-batch"
    path="/inventory/serial-batch"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventorySerialBatch /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/reports"
    path="/inventory/reports"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryReports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/settings"
    path="/inventory/settings"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventorySettings /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/warehouses"
    path="/inventory/warehouses"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryWarehouses /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/stock-levels"
    path="/inventory/stock-levels"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryStockLevels /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/transfers"
    path="/inventory/transfers"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryTransfers /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/inventory/adjustments"
    path="/inventory/adjustments"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.InventoryAdjustments /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Procurement Routes
 */
export const ProcurementRoutes = () => [
  <Route
    key="/procurement"
    path="/procurement"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementManagement /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/vendors"
    path="/procurement/vendors"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementVendors /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/purchase-orders"
    path="/procurement/purchase-orders"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementPurchaseOrders /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/requisitions"
    path="/procurement/requisitions"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementRequisitions /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/goods-receipts"
    path="/procurement/goods-receipts"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementGoodsReceipts /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/rfq"
    path="/procurement/rfq"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementRFQ /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/vendor-contracts"
    path="/procurement/vendor-contracts"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementVendorContracts /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/vendor-performance"
    path="/procurement/vendor-performance"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementVendorPerformance /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/reports"
    path="/procurement/reports"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementReports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/procurement/settings"
    path="/procurement/settings"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.ProcurementSettings /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];

/**
 * Assets Routes
 */
export const AssetRoutes = () => [
  <Route
    key="/assets"
    path="/assets"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.Assets /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/categories"
    path="/assets/categories"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetCategories /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/locations"
    path="/assets/locations"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetLocations /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/maintenance"
    path="/assets/maintenance"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetMaintenance /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/depreciation"
    path="/assets/depreciation"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetDepreciation /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/disposals"
    path="/assets/disposals"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetDisposals /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/reports"
    path="/assets/reports"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetReports /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="/assets/settings"
    path="/assets/settings"
    element={
      <ProtectedRoute requiredRole={["admin", "super_admin"]}>
        <DashboardLayout>
          <SuspenseRoute><Pages.AssetSettings /></SuspenseRoute>
        </DashboardLayout>
      </ProtectedRoute>
    }
  />,
];
