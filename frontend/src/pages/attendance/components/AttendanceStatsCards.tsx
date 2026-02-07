/**
 * Attendance statistics cards
 */

import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, TrendingDown, Activity, ArrowUp, ArrowDown } from "lucide-react";
import type { AttendanceStats } from "./types";

interface AttendanceStatsCardsProps {
  stats: AttendanceStats;
  attendanceRate: number;
  variant?: 'admin' | 'employee';
}

export function AttendanceStatsCards({ stats, attendanceRate, variant = 'admin' }: AttendanceStatsCardsProps) {
  if (variant === 'employee') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-2xl font-bold">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
              <p className="text-3xl font-bold mt-2">{attendanceRate}%</p>
              <div className="flex items-center gap-1 mt-2">
                {attendanceRate >= 90 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${attendanceRate >= 90 ? 'text-green-500' : 'text-red-500'}`}>
                  {attendanceRate >= 90 ? 'Excellent' : 'Needs Attention'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Present</p>
              <p className="text-2xl font-bold">{stats.present}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Late</p>
              <p className="text-2xl font-bold">{stats.late}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold">{stats.absent}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
