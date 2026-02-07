/**
 * System Health Dashboard
 * Displays comprehensive system health metrics and monitoring with high performance
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl } from '@/config/api';
import { Activity, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import {
  getStatusBadge,
  OverviewTabContent,
  DatabaseTabContent,
  SystemTabContent,
  PerformanceTabContent,
  ServicesHealthGrid,
} from './components';
import type { SystemHealth } from './components';

export default function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const fetchHealth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/api/system-health`;

      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || import.meta.env.DEV)) {
        console.log('[System Health] Fetching from URL:', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Agency-Database': localStorage.getItem('agency_database') || '',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch health data';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          errorMessage = `${errorMessage} (status ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        setHealth(result.data);
      } else {
        throw new Error(result.error?.message || result.error || 'Failed to fetch health data');
      }
    } catch (error: unknown) {
      const err = error as Error;
      const errorMessage = err?.message || 'Failed to fetch system health';

      const isCorsError = errorMessage.includes('CORS') ||
        errorMessage.includes('cross-origin') ||
        errorMessage.includes('Access-Control') ||
        (err.name === 'TypeError' && errorMessage.includes('Failed to fetch'));

      console.error('Error fetching health:', {
        message: errorMessage,
        error: err,
        stack: err?.stack,
        name: err?.name,
        isCorsError,
        apiBase: getApiBaseUrl(),
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      });

      let userMessage = errorMessage;
      if (isCorsError || errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        userMessage = 'Unable to connect to the server. This may be a CORS or network configuration issue.';
      }

      toast({
        title: 'Error',
        description: userMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading system health...</span>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-semibold">Failed to load system health</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">
            Comprehensive system monitoring and performance metrics
            {health.cached && <span className="ml-2 text-xs text-muted-foreground">(Cached)</span>}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Overall Status
            </CardTitle>
            {getStatusBadge(health.status)}
          </div>
          <CardDescription>
            Last updated: {new Date(health.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent health={health} />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseTabContent health={health} />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemTabContent health={health} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTabContent health={health} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServicesHealthGrid health={health} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
