/**
 * Project Card Component
 * Modern design-token based project card matching CRM layout
 */

import { FloatingCard } from "@/components/ui/design-tokens";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Calendar, Users, Eye, Edit, Trash2, MoreVertical, Clock, Calculator, Building2, ExternalLink, IndianRupee } from "lucide-react";
import { Project, getStatusColor, getStatusLabel } from '../utils/projectUtils';

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onNavigateToEmployees?: (params: any) => void;
  onNavigateToAttendance?: (params: any) => void;
  onNavigateToPayroll?: (params: any) => void;
  onNavigateToDepartment?: (departmentId: string, departmentName?: string) => void;
  urlDepartmentId?: string | null;
  legacyDepartmentId?: string | null;
  displayDepartmentName?: string | null;
}

export const ProjectCard = ({
  project,
  onView,
  onEdit,
  onDelete,
  onNavigateToEmployees,
  onNavigateToAttendance,
  onNavigateToPayroll,
  onNavigateToDepartment,
  urlDepartmentId,
  legacyDepartmentId,
  displayDepartmentName,
}: ProjectCardProps) => {
  const hasTeamMembers = () => {
    if (!project.assigned_team) return false;
    try {
      const teamMembers = typeof project.assigned_team === 'string' 
        ? JSON.parse(project.assigned_team) 
        : project.assigned_team;
      return Array.isArray(teamMembers) && teamMembers.length > 0;
    } catch {
      return false;
    }
  };

  const priorityColor = () => {
    switch (project.priority) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <FloatingCard className="p-6 transition-all duration-300 hover:shadow-md border border-gray-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm group">
      <div className="space-y-5">
        {/* Header: Title, Description & Badges */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 
                onClick={() => onView(project)}
                className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {project.name}
              </h3>
              {project.project_code && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                  {project.project_code}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {project.priority && (
              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityColor()}`}>
                {project.priority}
              </span>
            )}
            <Badge variant={getStatusColor(project.status)} className="rounded-full px-3 py-0.5 text-xs font-semibold">
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 bg-gray-50/60 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-gray-100/80 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <span>Completion Progress</span>
            </span>
            <span className="font-bold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="w-full h-2 rounded-full" />
        </div>

        {/* Project Meta Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-500 dark:text-gray-400">
          {project.start_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span>Start: <strong className="text-gray-700 dark:text-gray-300 font-medium">{new Date(project.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
            </div>
          )}
          {project.end_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span>Due: <strong className="text-gray-700 dark:text-gray-300 font-medium">{new Date(project.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
            </div>
          )}
          {project.client && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="truncate">Client: <strong className="text-gray-700 dark:text-gray-300 font-medium">{project.client.company_name || project.client.name}</strong></span>
            </div>
          )}
        </div>

        {/* Bottom Bar: Budget & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
            <span className="text-xs text-gray-400 font-normal">Budget:</span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              ₹{(project.budget || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onView(project)} 
              className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              View
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-xl min-w-[190px]">
                <DropdownMenuItem onClick={() => onView(project)} className="rounded-xl cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(project)} className="rounded-xl cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {hasTeamMembers() && (
                  <>
                    {onNavigateToEmployees && (
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer"
                        onClick={() => {
                          onNavigateToEmployees({ 
                            departmentId: urlDepartmentId || legacyDepartmentId || undefined,
                            departmentName: displayDepartmentName || undefined
                          });
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Team Members
                        <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    )}
                    {onNavigateToAttendance && (
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer"
                        onClick={() => {
                          onNavigateToAttendance({ 
                            projectId: project.id,
                            projectName: project.name,
                            departmentId: urlDepartmentId || legacyDepartmentId || undefined,
                            departmentName: displayDepartmentName || undefined
                          });
                        }}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Team Attendance
                        <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    )}
                    {onNavigateToPayroll && (
                      <DropdownMenuItem 
                        className="rounded-xl cursor-pointer"
                        onClick={() => {
                          onNavigateToPayroll({ 
                            projectId: project.id,
                            projectName: project.name,
                            departmentId: urlDepartmentId || legacyDepartmentId || undefined,
                            departmentName: displayDepartmentName || undefined
                          });
                        }}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Team Payroll
                        <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {displayDepartmentName && (urlDepartmentId || legacyDepartmentId) && onNavigateToDepartment && (
                  <DropdownMenuItem 
                    className="rounded-xl cursor-pointer"
                    onClick={() => onNavigateToDepartment(urlDepartmentId || legacyDepartmentId || undefined, displayDepartmentName || undefined)}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View Department
                    <ExternalLink className="h-3 w-3 ml-auto text-gray-400" />
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(project)}
                  className="rounded-xl text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </FloatingCard>
  );
};
