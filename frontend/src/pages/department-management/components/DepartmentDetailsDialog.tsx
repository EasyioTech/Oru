/**
 * Department details dialog
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Clock, Calculator } from "lucide-react";
import type { Department } from "./types";

interface DepartmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  employees: Array<{
    id: string;
    user_id: string;
    position_title?: string;
    role_in_department: string;
    full_name: string;
  }>;
  loadingEmployees: boolean;
  onViewEmployees: (id: string, name: string) => void;
  onViewProjects: (id: string, name: string) => void;
  onViewAttendance: (id: string, name: string) => void;
  onViewPayroll: (id: string, name: string) => void;
}

export function DepartmentDetailsDialog({
  open,
  onOpenChange,
  department,
  employees,
  loadingEmployees,
  onViewEmployees,
  onViewProjects,
  onViewAttendance,
  onViewPayroll,
}: DepartmentDetailsDialogProps) {
  if (!department) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{department.name}</DialogTitle>
          <DialogDescription>Complete department information and details</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="mt-1 text-sm">{department.description || "No description provided"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Manager</label>
              <p className="mt-1">{department.manager?.full_name || "No manager assigned"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Parent Department</label>
              <p className="mt-1">{department.parent_department?.name || "Top level department"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Budget</label>
              <p className="mt-1">
                {department.budget ? `₹${department.budget.toLocaleString()}` : "No budget set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Employees</label>
              <p className="mt-1">{department._count?.team_assignments || 0} employees</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={department.is_active ? "default" : "secondary"}>
                  {department.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="mt-1">{new Date(department.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">Quick Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onViewEmployees(department.id, department.name);
                }}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                View Employees
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onViewProjects(department.id, department.name);
                }}
                className="w-full"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                View Projects
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onViewAttendance(department.id, department.name);
                }}
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                View Attendance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onViewPayroll(department.id, department.name);
                }}
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                View Payroll
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Employees ({employees.length})
            </label>
            {loadingEmployees ? (
              <p className="text-sm text-muted-foreground">Loading employees...</p>
            ) : employees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employees assigned to this department</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{employee.full_name}</p>
                        {employee.position_title && (
                          <p className="text-xs text-muted-foreground">{employee.position_title}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {employee.role_in_department}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
