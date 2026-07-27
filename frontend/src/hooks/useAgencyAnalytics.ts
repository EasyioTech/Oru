import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logError } from '@/utils/consoleLogger';

export interface AgencyInfo {
  id: string;
  name: string;
  domain: string;
  status: string;
  subscriptionPlan: string | null;
  isActive: boolean;
  maxUsers: number | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

export interface AgencyMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  monthlyRevenue: number;
  attendanceRecords: number;
  leaveRequests: {
    pending: number;
    approved: number;
    total: number;
  };
  recentActivity: {
    newUsers: number;
    newProjects: number;
    newInvoices: number;
  };
}

const DEFAULT_METRICS: AgencyMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  totalProjects: 0,
  activeProjects: 0,
  totalClients: 0,
  totalInvoices: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  attendanceRecords: 0,
  leaveRequests: { pending: 0, approved: 0, total: 0 },
  recentActivity: { newUsers: 0, newProjects: 0, newInvoices: 0 },
};

export const useAgencyAnalytics = () => {
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [metrics, setMetrics] = useState<AgencyMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgencyMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/agencies/me/dashboard', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to load dashboard data');
      }

      setAgency(json.data.agency ?? null);
      setMetrics(json.data.metrics ?? DEFAULT_METRICS);
    } catch (err: unknown) {
      logError('Error fetching agency metrics:', err);
      setError((err as Error).message);
      toast({
        title: 'Error loading dashboard',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencyMetrics();
  }, [fetchAgencyMetrics]);

  return {
    agency,
    metrics,
    loading,
    error,
    refreshMetrics: fetchAgencyMetrics,
  };
};
