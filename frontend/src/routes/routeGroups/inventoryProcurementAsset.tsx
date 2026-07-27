/**
 * Inventory, Procurement & Asset Routes
 */

import { Route } from "react-router-dom";
import ProtectedRoute from "@/core/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SuspenseRoute } from "../SuspenseRoute";
import * as Pages from "../lazyImports";

// Inventory routes deferred — module not active in MVP
export const InventoryRoutes = () => [];

/**
 * Procurement Routes
 */
export const ProcurementRoutes = () => [];

/**
 * Assets Routes
 */
export const AssetRoutes = () => [];
