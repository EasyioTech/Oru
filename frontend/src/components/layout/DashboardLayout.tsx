/**
 * Dashboard Layout Component
 * Provides the standard layout with sidebar and header for authenticated pages.
 * Uses the dashboard-shell (Sidebar + Header) for production-ready, scalable layout.
 */

import { DashboardShellLayout } from "@/components/layout/dashboard-shell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <DashboardShellLayout>{children}</DashboardShellLayout>
);
