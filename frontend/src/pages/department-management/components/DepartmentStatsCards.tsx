/**
 * Department statistics cards
 */

import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, DollarSign, UserCheck } from "lucide-react";
import type { DepartmentStats } from "./types";

interface DepartmentStatsCardsProps {
  stats: DepartmentStats;
}

export function DepartmentStatsCards({ stats }: DepartmentStatsCardsProps) {
  const formatBudget = (val: number) =>
    val >= 1000000
      ? `${(val / 1000000).toFixed(1)}M`
      : val >= 1000
        ? `${(val / 1000).toFixed(1)}K`
        : val.toLocaleString();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-2xl sm:text-3xl font-bold truncate" title={stats.active.toString()}>
                {stats.active}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Departments</p>
              {stats.inactive > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{stats.inactive} inactive</p>
              )}
            </div>
            <div className="flex-shrink-0 ml-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-2xl sm:text-3xl font-bold truncate" title={stats.totalEmployees.toString()}>
                {stats.totalEmployees}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Employees</p>
              <p className="text-xs text-muted-foreground mt-1">Avg: {stats.avgEmployees} per dept</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p
                className="text-xl sm:text-2xl lg:text-3xl font-bold truncate"
                title={`₹${stats.totalBudget.toLocaleString()}`}
              >
                ₹{formatBudget(stats.totalBudget)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Budget</p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ₹{formatBudget(stats.avgBudget)}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-2xl sm:text-3xl font-bold truncate" title={stats.departmentsWithManager.toString()}>
                {stats.departmentsWithManager}
              </p>
              <p className="text-sm text-muted-foreground mt-1">With Managers</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.departmentsWithParent} with parent
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
