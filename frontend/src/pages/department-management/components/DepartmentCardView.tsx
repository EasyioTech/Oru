/**
 * Department card view
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trash2 } from "lucide-react";
import { DepartmentActionsMenu } from "./DepartmentActionsMenu";
import type { Department } from "./types";

interface DepartmentCardViewProps {
  departments: Department[];
  isAdmin: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  countLabel?: string;
  onViewDetails: (d: Department) => void;
  onViewEmployees: (id: string, name: string) => void;
  onViewProjects: (id: string, name: string) => void;
  onViewAttendance: (id: string, name: string) => void;
  onViewPayroll: (id: string, name: string) => void;
  onEdit: (d: Department) => void;
  onDuplicate: (d: Department) => void;
  onArchive: (d: Department) => void;
  onRestore: (d: Department) => void;
  onDelete: (d: Department) => void;
  isDeactivated?: boolean;
}

export function DepartmentCardView({
  departments,
  isAdmin,
  currentPage,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  countLabel = "departments",
  onViewDetails,
  onViewEmployees,
  onViewProjects,
  onViewAttendance,
  onViewPayroll,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  isDeactivated = false,
}: DepartmentCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((department) => (
        <Card key={department.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{department.name}</CardTitle>
              {isDeactivated ? (
                <Badge variant="secondary">Deactivated</Badge>
              ) : (
                <DepartmentActionsMenu
                  department={department}
                  isAdmin={isAdmin}
                  isDeactivated={false}
                  onViewDetails={onViewDetails}
                  onViewEmployees={onViewEmployees}
                  onViewProjects={onViewProjects}
                  onViewAttendance={onViewAttendance}
                  onViewPayroll={onViewPayroll}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onArchive={onArchive}
                  onRestore={onRestore}
                  onDelete={onDelete}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {department.description && (
              <p className="text-sm text-muted-foreground">{department.description}</p>
            )}
            <div className="space-y-2">
              {department.manager && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Manager</Badge>
                  <span className="text-sm">{department.manager.full_name}</span>
                </div>
              )}
              {department.parent_department && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Parent</Badge>
                  <span className="text-sm">{department.parent_department.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">{department._count?.team_assignments || 0} Members</Badge>
                {department.budget && department.budget > 0 && (
                  <Badge variant="outline">₹{department.budget.toLocaleString()} Budget</Badge>
                )}
              </div>
            </div>
            {isDeactivated && isAdmin && (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onRestore(department)} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(department)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {totalPages > 1 && (
        <div className="col-span-full flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          <div className="text-sm">Page {currentPage} of {totalPages}</div>
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
