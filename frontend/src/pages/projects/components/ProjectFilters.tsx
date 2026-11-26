/**
 * Project Filters Component
 * Modern design-token based filter bar matching CRM layout
 */

import { FloatingCard } from "@/components/ui/design-tokens";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  clientFilter: string;
  onClientFilterChange: (value: string) => void;
  managerFilter: string;
  onManagerFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  clients: Array<{ id: string; name: string; company_name: string | null }>;
  employees: Array<{ id: string; full_name: string }>;
  departments: Array<{ id: string; name: string }>;
}

export const ProjectFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  clientFilter,
  onClientFilterChange,
  managerFilter,
  onManagerFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  clients,
  employees,
  departments,
}: ProjectFiltersProps) => {
  const selectTriggerClass = "h-11 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200/60 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium";
  const selectContentClass = "rounded-2xl border-gray-200/60 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl";

  return (
    <FloatingCard className="p-4 sm:p-5 mt-4">
      <div className="space-y-4">
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search projects by name, code, description, or client..." 
              className="pl-11 h-11 bg-gray-50/50 dark:bg-slate-800/50 border-gray-200/60 dark:border-slate-700 rounded-2xl focus-visible:ring-gray-300 text-xs sm:text-sm" 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className={`w-full sm:w-[145px] ${selectTriggerClass}`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
              <SelectTrigger className={`w-full sm:w-[130px] ${selectTriggerClass}`}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className={`w-full sm:w-[145px] ${selectTriggerClass}`}>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="budget">Budget (High-Low)</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="start_date">Start Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showAdvancedFilters ? "default" : "outline"}
              onClick={onToggleAdvancedFilters}
              className={`h-11 rounded-2xl px-4 text-xs font-semibold gap-2 border-gray-200/60 dark:border-slate-700 transition-all ${
                showAdvancedFilters ? "bg-black text-white dark:bg-white dark:text-black shadow-sm" : "bg-gray-50/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1">Client</Label>
              <Select value={clientFilter} onValueChange={onClientFilterChange}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1">Project Manager</Label>
              <Select value={managerFilter} onValueChange={onManagerFilterChange}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="All Managers" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all">All Managers</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-1">Department</Label>
              <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </FloatingCard>
  );
};
