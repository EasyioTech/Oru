import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { SystemHealth } from './types';

interface HealthMetricsChartProps {
  health: SystemHealth;
}

/**
 * Displays response time and metrics trends when available from the health API.
 * Renders a placeholder when trends data is not yet available.
 */
export const HealthMetricsChart = ({ health }: HealthMetricsChartProps) => {
  const trends = health.trends;
  const hasTrends = trends?.available && trends?.hourly && Array.isArray(trends.hourly) && trends.hourly.length > 0;

  if (!hasTrends) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Response Time Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Historical metrics will appear here when trend data is available from the health endpoint.
          </p>
          {(health.services.database?.responseTime !== undefined || health.services.redis?.responseTime !== undefined) && (
            <div className="mt-4 space-y-2">
              {health.services.database?.responseTime !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Database (current)</span>
                  <span className="font-mono">{health.services.database.responseTime}ms</span>
                </div>
              )}
              {health.services.redis?.responseTime !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Redis (current)</span>
                  <span className="font-mono">{health.services.redis.responseTime}ms</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Future: render chart when trends.hourly has data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Response Time Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {trends.hourly.length} data points available.
        </p>
      </CardContent>
    </Card>
  );
};
