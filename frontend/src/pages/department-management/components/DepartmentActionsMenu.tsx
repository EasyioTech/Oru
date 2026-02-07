/**
 * Department actions dropdown menu
 */

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Users,
  Briefcase,
  Clock,
  Calculator,
  Edit,
  Copy,
  Archive,
  RefreshCw,
  Trash2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import type { Department } from "./types";

interface DepartmentActionsMenuProps {
  department: Department;
  isAdmin: boolean;
  isDeactivated?: boolean;
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
}

export function DepartmentActionsMenu({
  department,
  isAdmin,
  isDeactivated = false,
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
}: DepartmentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(department)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        {isDeactivated ? (
          <>
            <DropdownMenuItem onClick={() => onRestore(department)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(department)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewEmployees(department.id, department.name)}>
              <Users className="h-4 w-4 mr-2" />
              View Employees
              <ExternalLink className="h-3 w-3 ml-auto" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewProjects(department.id, department.name)}>
              <Briefcase className="h-4 w-4 mr-2" />
              View Projects
              <ExternalLink className="h-3 w-3 ml-auto" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewAttendance(department.id, department.name)}>
              <Clock className="h-4 w-4 mr-2" />
              View Attendance
              <ExternalLink className="h-3 w-3 ml-auto" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewPayroll(department.id, department.name)}>
              <Calculator className="h-4 w-4 mr-2" />
              View Payroll
              <ExternalLink className="h-3 w-3 ml-auto" />
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(department)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(department)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive(department)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(department)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
