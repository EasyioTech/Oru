/**
 * Project Pipeline/Kanban View Component
 * Modern design-token based pipeline matching CRM PipelineBoard
 */

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Users, IndianRupee, Eye, Edit, Trash2, GripVertical, ClipboardList, Zap, PauseCircle, CheckCircle2, XCircle, FolderKanban } from "lucide-react";
import { Project, PIPELINE_STAGES, getStatusColor, getStatusLabel, getStatusBorderColor, formatCurrency } from '../utils/projectUtils';

const getStageIcon = (status: string) => {
  switch (status) {
    case 'planning': return <ClipboardList className="w-5 h-5 text-blue-500" />;
    case 'in-progress': return <Zap className="w-5 h-5 text-indigo-500" />;
    case 'on-hold': return <PauseCircle className="w-5 h-5 text-amber-500" />;
    case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <ClipboardList className="w-5 h-5 text-muted-foreground" />;
  }
};

interface ProjectPipelineProps {
  projects: Project[];
  projectsByStatus: Record<string, Project[]>;
  draggedProject: string | null;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, newStatus: string) => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectPipeline = ({
  projects,
  projectsByStatus,
  draggedProject,
  searchTerm,
  statusFilter,
  priorityFilter,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onView,
  onEdit,
  onDelete,
}: ProjectPipelineProps) => {
  const filterProject = (project: Project) => {
    const matchesSearch = !searchTerm ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedStatus = project.status === 'in_progress' ? 'in-progress' : 
                             project.status === 'on_hold' ? 'on-hold' : project.status;
    const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Project Pipeline</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drag and drop projects through stages to update their progress in real-time
          </p>
        </div>
      </div>

      <div className="flex gap-4 lg:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-thin">
        {PIPELINE_STAGES.map((stage) => {
          const stageProjects = (projectsByStatus[stage.status] || []).filter(filterProject);
          const stageBudget = stageProjects.reduce((sum, project) => {
            const budget = typeof project.budget === 'number' ? project.budget : 
                          typeof project.budget === 'string' ? parseFloat(project.budget) || 0 : 0;
            return sum + budget;
          }, 0);
          const avgProgress = stageProjects.length > 0
            ? Math.round(stageProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / stageProjects.length)
            : 0;
          
          return (
            <div 
              key={stage.status} 
              className="flex-shrink-0 w-[290px] sm:w-[310px] md:w-[330px] lg:w-[340px]"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, stage.status)}
            >
              <div className="bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl p-4 min-h-[600px] border border-gray-100 dark:border-slate-800 flex flex-col shadow-2xs transition-all">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-gray-200/60 dark:border-slate-800 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    {getStageIcon(stage.status)}
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{stage.name}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-slate-700 shadow-2xs">
                    {stageProjects.length}
                  </span>
                </div>

                {/* Stage Budget & Avg Progress summary */}
                <div className="space-y-2 mb-3.5 pb-3 border-b border-gray-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 rounded-xl p-2.5 flex-shrink-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Budget</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(stageBudget)}
                    </span>
                  </div>
                  {stageProjects.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 dark:text-gray-400">Avg Progress</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{avgProgress}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-1.5" />
                    </div>
                  )}
                </div>

                {/* Projects List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] scrollbar-thin pr-1">
                  {stageProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-white/30 dark:bg-slate-900/20">
                      <FolderKanban className="h-8 w-8 mb-2 opacity-40" />
                      <div className="text-xs font-medium">Drop projects here</div>
                    </div>
                  ) : (
                    stageProjects.map((project) => {
                      const isDragging = draggedProject === project.id;
                      const projectBudget = typeof project.budget === 'number' ? project.budget : 
                                          typeof project.budget === 'string' ? parseFloat(project.budget) || 0 : 0;
                      
                      return (
                        <div 
                          key={project.id} 
                          draggable
                          onDragStart={(e) => onDragStart(e, project.id)}
                          onDragEnd={onDragEnd}
                          onClick={() => onView(project)}
                          className={`relative p-3.5 rounded-xl cursor-pointer bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700/80 shadow-2xs hover:shadow-md transition-all group ${
                            isDragging ? 'opacity-50 scale-95' : 'hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Status Badge and Drag Handle */}
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={getStatusColor(project.status)} 
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              >
                                {getStatusLabel(project.status)}
                              </Badge>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" onMouseDown={(e) => e.stopPropagation()}>
                                <GripVertical className="h-3.5 w-3.5 text-gray-400" />
                              </div>
                            </div>
                            
                            {/* Project Name */}
                            <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title={project.name}>
                              {project.name}
                            </div>
                            
                            {/* Client Info */}
                            {project.client && (
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/60 rounded-lg px-2 py-1">
                                <Users className="h-3 w-3 text-gray-400 shrink-0" />
                                <span className="truncate font-medium">
                                  {project.client.company_name || project.client.name}
                                </span>
                              </div>
                            )}

                            {/* Budget */}
                            {projectBudget > 0 && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-900/60 rounded-lg px-2 py-1">
                                <IndianRupee className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{formatCurrency(projectBudget)}</span>
                              </div>
                            )}

                            {/* Progress */}
                            <div className="space-y-1 bg-gray-50/70 dark:bg-slate-900/50 rounded-lg p-2">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{project.progress || 0}%</span>
                              </div>
                              <Progress value={project.progress || 0} className="h-1.5" />
                            </div>

                            {/* Dates */}
                            {(project.start_date || project.end_date) && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {project.end_date && new Date(project.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            )}

                            {/* Quick Actions on Hover */}
                            <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] flex-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(project);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" /> View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] flex-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(project);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-lg text-gray-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(project);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
