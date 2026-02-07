/**
 * Attendance quick insights cards
 */

import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle } from "lucide-react";
import type { AttendanceInsight } from "./types";

interface AttendanceInsightsProps {
  insights: AttendanceInsight[];
}

export function AttendanceInsights({ insights }: AttendanceInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {insights.map((insight, idx) => (
        <Card
          key={idx}
          className={`border-l-4 ${
            insight.type === 'success' ? 'border-l-green-500' :
            insight.type === 'warning' ? 'border-l-yellow-500' :
            insight.type === 'error' ? 'border-l-red-500' :
            'border-l-blue-500'
          }`}
        >
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              {insight.type === 'success' && <Activity className="h-5 w-5 text-green-500 mt-0.5" />}
              {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
              {insight.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
              {insight.type === 'info' && <Activity className="h-5 w-5 text-blue-500 mt-0.5" />}
              <div className="flex-1">
                <p className="font-semibold text-sm">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                {insight.count !== undefined && (
                  <p className="text-lg font-bold mt-2">{insight.count}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
