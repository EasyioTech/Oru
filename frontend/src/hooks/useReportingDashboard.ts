import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardData {
  financial?: {
    revenue?: number;
    pending_revenue?: number;
    overdue_revenue?: number;
    expenses?: number;
    profit?: number;
    paid_invoices?: number;
    pending_invoices?: number;
    overdue_invoices?: number;
  };
  inventory?: {
    total_products?: number;
    total_warehouses?: number;
    total_quantity?: number;
    total_stock_value?: number;
    low_stock_items?: number;
  };
  procurement?: {
    total_requisitions?: number;
    approved_requisitions?: number;
    total_purchase_orders?: number;
    completed_orders?: number;
    pending_po_value?: number;
    completed_po_value?: number;
  };
  assets?: {
    total_assets?: number;
    active_assets?: number;
    maintenance_assets?: number;
    total_asset_value?: number;
    total_current_value?: number;
    total_depreciation?: number;
  };
  projects?: {
    total_projects?: number;
    active_projects?: number;
    completed_projects?: number;
    total_budget?: number;
    completed_budget?: number;
  };
  hr?: {
    total_employees?: number;
    active_employees?: number;
    attendance_records?: number;
    present_count?: number;
    attendance_rate?: number;
  };
  recent_activity?: Array<{
    module: string;
    count: number;
  }>;
  date_range?: {
    from: string;
    to: string;
  };
}

export function useReportingDashboard(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['reporting-dashboard', dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      const response = await api.get(`/reports/dashboard?${params.toString()}`);
      return response.data.data as DashboardData;
    },
    enabled: !!dateFrom && !!dateTo,
  });
}
