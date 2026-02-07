/**
 * Department list view
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentActionsMenu } from "./DepartmentActionsMenu";
import type { Department } from "./types";

interface DepartmentListViewProps {
  departments: Department[];
  isAdmin: boolean;
  selectedDepartments: Set<string>;
  onSelectDepartment: (id: string) => void;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
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

export function DepartmentListView({
  departments,
  isAdmin,
  selectedDepartments,
  onSelectDepartment,
  currentPage,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onPageSizeChange,
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
}: DepartmentListViewProps) {
  return (
    <div className="space-y-2">
      {departments.map((department) => (
        <Card key={department.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {isAdmin && (
                  <Checkbox
                    checked={selectedDepartments.has(department.id)}
                    onCheckedChange={() => onSelectDepartment(department.id)}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{department.name}</h3>
                    <Badge variant={department.is_active ? "default" : "secondary"}>
                      {department.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {department.description && (
                    <p className="text-sm text-muted-foreground mt-1">{department.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {department.manager && (
                      <span className="text-muted-foreground">Manager: {department.manager.full_name}</span>
                    )}
                    {department.budget && (
                      <span className="text-muted-foreground">
                        Budget: ₹{department.budget.toLocaleString()}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      Employees: {department._count?.team_assignments || 0}
                    </span>
                  </div>
                </div>
                <DepartmentActionsMenu
                  department={department}
                  isAdmin={isAdmin}
                  isDeactivated={isDeactivated}
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
            {totalCount} {countLabel}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <div className="text-sm">Page {currentPage} of {totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              Next
            </Button>
            <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(parseInt(v))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
