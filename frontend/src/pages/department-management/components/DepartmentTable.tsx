/**
 * Department table view
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";
import { DepartmentActionsMenu } from "./DepartmentActionsMenu";
import type { Department, SortField, SortDirection } from "./types";

interface DepartmentTableProps {
  departments: Department[];
  isAdmin: boolean;
  selectedDepartments: Set<string>;
  onSelectAll: () => void;
  onSelectDepartment: (id: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
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

const SortIcon = ({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: SortDirection }) => {
  if (sortField !== field) return null;
  return sortDirection === "asc" ? (
    <ChevronUp className="h-4 w-4 ml-1" />
  ) : (
    <ChevronDown className="h-4 w-4 ml-1" />
  );
};

export function DepartmentTable({
  departments,
  isAdmin,
  selectedDepartments,
  onSelectAll,
  onSelectDepartment,
  sortField,
  sortDirection,
  onSort,
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
}: DepartmentTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedDepartments.size === departments.length && departments.length > 0}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => onSort("name")}>
                  <div className="flex items-center">
                    Name
                    <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => onSort("budget")}>
                  <div className="flex items-center">
                    Budget
                    <SortIcon field="budget" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => onSort("employees")}>
                  <div className="flex items-center">
                    Employees
                    <SortIcon field="employees" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  {isAdmin && (
                    <TableCell>
                      <Checkbox
                        checked={selectedDepartments.has(department.id)}
                        onCheckedChange={() => onSelectDepartment(department.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{department.description || "-"}</TableCell>
                  <TableCell>
                    {department.manager ? (
                      <Badge variant="outline">{department.manager.full_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {department.parent_department ? (
                      <Badge variant="secondary">{department.parent_department.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {department.budget ? `₹${department.budget.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{department._count?.team_assignments || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={department.is_active ? "default" : "secondary"}>
                      {department.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
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
      </CardContent>
    </Card>
  );
}
