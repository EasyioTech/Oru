import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Search, Download, Filter, Grid3x3, List, Table2, RefreshCw } from "lucide-react";
import { db } from "@/lib/database";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAgencyId } from "@/utils/agencyUtils";
import {
  fetchDepartmentsList,
  fetchDepartmentsStats,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type DepartmentStats as ApiDepartmentStats,
} from "@/services/api/departments";
import {
  DepartmentFormDialog,
  DepartmentHierarchyView,
  DepartmentStatsCards,
  DepartmentFilters,
  DepartmentTable,
  DepartmentListView,
  DepartmentCardView,
  DepartmentDetailsDialog,
  type Department,
  type ViewMode,
  type SortField,
  type SortDirection,
} from "./components";
import { TeamAssignmentPanel } from "@/components/TeamAssignmentPanel";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("departments");

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterManager, setFilterManager] = useState<string>("all");
  const [filterParent, setFilterParent] = useState<string>("all");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");

  const [managers, setManagers] = useState<Array<{ user_id: string; full_name: string }>>([]);
  const [parentDepartments, setParentDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<Array<{
    id: string;
    user_id: string;
    position_title?: string;
    role_in_department: string;
    full_name: string;
  }>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [departmentMembers, setDepartmentMembers] = useState<Record<string, Array<{
    id: string;
    full_name: string;
    position_title?: string;
    role_in_department: string;
  }>>>({});
  const [listTotal, setListTotal] = useState(0);
  const [apiStats, setApiStats] = useState<ApiDepartmentStats | null>(null);

  const { user, userRole, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const isHR = userRole === "hr";

  useEffect(() => {
    fetchManagers();
    fetchParentDepartments();
  }, []);

  const fetchStats = async () => {
    try {
      const s = await fetchDepartmentsStats();
      setApiStats(s);
    } catch {
      setApiStats({ active: 0, inactive: 0, totalBudget: 0, totalEmployees: 0 });
    }
  };

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStats();
      const isDeactivated = activeTab === "deactivated";
      const isHierarchy = activeTab === "hierarchy";
      const limit = isHierarchy ? 2000 : pageSize;
      const offset = isHierarchy ? 0 : (currentPage - 1) * pageSize;
      const { departments: list, total } = await fetchDepartmentsList({
        limit,
        offset,
        sortBy: sortField === "employees" ? "employees" : sortField === "created_at" ? "created_at" : "name",
        sortDir: sortDirection,
        search: searchTerm.trim() || undefined,
        is_active: isHierarchy ? undefined : !isDeactivated,
        manager_id: filterManager !== "all" ? filterManager : undefined,
        parent_department_id: filterParent !== "all" ? filterParent : undefined,
        min_budget: minBudget || undefined,
        max_budget: maxBudget || undefined,
      });
      setDepartments(list);
      setListTotal(total);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch departments.",
        variant: "destructive",
      });
      setDepartments([]);
      setListTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, sortField, sortDirection, searchTerm, filterManager, filterParent, minBudget, maxBudget, toast]);

  useEffect(() => {
    if (activeTab === "departments" || activeTab === "deactivated" || activeTab === "hierarchy") {
      fetchDepartments();
    }
  }, [fetchDepartments, activeTab]);

  const fetchManagers = async () => {
    try {
      const agencyId = profile?.agency_id;
      let query = db.from("profiles").select("user_id, full_name").eq("is_active", true);
      if (agencyId) query = query.eq("agency_id", agencyId);
      const { data, error } = await query.order("full_name");
      if (error) throw error;
      if (data) setManagers(data);
    } catch {
      // Silently handle
    }
  };

  const fetchParentDepartments = async () => {
    try {
      const agencyId = profile?.agency_id;
      let query = db.from("departments").select("id, name").eq("is_active", true);
      if (agencyId) query = query.eq("agency_id", agencyId);
      const { data, error } = await query.order("name");
      if (error) throw error;
      if (data) setParentDepartments(data);
    } catch {
      // Silently handle
    }
  };

  const fetchDepartmentEmployees = async (departmentId: string) => {
    setLoadingEmployees(true);
    try {
      const { data: assignments, error } = await db
        .from("team_assignments")
        .select("id, user_id, position_title, role_in_department")
        .eq("department_id", departmentId)
        .eq("is_active", true);
      if (error) throw error;
      if (assignments && assignments.length > 0) {
        const employeeData = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const { data: profileData } = await db
                .from("profiles")
                .select("full_name")
                .eq("user_id", assignment.user_id)
                .single();
              return {
                id: assignment.id,
                user_id: assignment.user_id,
                position_title: assignment.position_title || "",
                role_in_department: assignment.role_in_department || "member",
                full_name: profileData?.full_name || "Unknown Employee",
              };
            } catch {
              return {
                id: assignment.id,
                user_id: assignment.user_id,
                position_title: assignment.position_title || "",
                role_in_department: assignment.role_in_department || "member",
                full_name: "Unknown Employee",
              };
            }
          })
        );
        setDepartmentEmployees(employeeData);
      } else {
        setDepartmentEmployees([]);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Error",
        description: err?.message || "Failed to fetch department employees",
        variant: "destructive",
      });
      setDepartmentEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const paginatedDepartments = activeTab === "departments" ? departments : [];
  const paginatedDeactivatedDepartments = activeTab === "deactivated" ? departments : [];
  const totalPages = Math.max(1, Math.ceil(listTotal / pageSize));
  const totalDeactivatedPages = Math.max(1, Math.ceil(listTotal / pageSize));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentForm(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = async (department: Department) => {
    setSelectedDepartment(department);
    setShowDetailsDialog(true);
    if (department.id) {
      try {
        const { data: deptData, error } = await db.from("departments").select("*").eq("id", department.id).single();
        if (error) throw error;
        let manager = null;
        if (deptData?.manager_id) {
          const { data: managerData } = await db.from("profiles").select("full_name").eq("user_id", deptData.manager_id).single();
          manager = managerData;
        }
        let parent_department = null;
        if (deptData?.parent_department_id) {
          const { data: parentData } = await db.from("departments").select("name").eq("id", deptData.parent_department_id).single();
          parent_department = parentData;
        }
        const { data: countData } = await db.from("team_assignments").select("id").eq("department_id", department.id).eq("is_active", true);
        setSelectedDepartment({
          ...deptData,
          manager,
          parent_department,
          _count: { team_assignments: countData?.length || 0 },
        } as Department);
        fetchDepartmentEmployees(department.id);
      } catch {
        fetchDepartmentEmployees(department.id);
      }
    }
  };

  const handleViewEmployees = (departmentId: string, departmentName: string) => {
    navigate(`/employee-management?department=${departmentId}&name=${encodeURIComponent(departmentName)}`);
  };
  const handleViewProjects = (departmentId: string, departmentName: string) => {
    navigate(`/projects?department=${departmentId}&name=${encodeURIComponent(departmentName)}`);
  };
  const handleViewAttendance = (departmentId: string, departmentName: string) => {
    navigate(`/attendance?department=${departmentId}&name=${encodeURIComponent(departmentName)}`);
  };
  const handleViewPayroll = (departmentId: string, departmentName: string) => {
    navigate(`/payroll?department=${departmentId}&name=${encodeURIComponent(departmentName)}`);
  };

  const handleDuplicate = async (department: Department) => {
    try {
      const agencyId = await getAgencyId(profile, user?.id);
      if (!agencyId) {
        toast({ title: "Error", description: "Agency ID not found.", variant: "destructive" });
        return;
      }
      await createDepartment({
        name: `${department.name} (Copy)`,
        description: department.description ?? undefined,
        manager_id: department.manager_id ?? undefined,
        parent_department_id: department.parent_department_id ?? undefined,
        budget: department.budget ?? 0,
        agency_id: agencyId,
      });
      toast({ title: "Success", description: "Department duplicated successfully" });
      fetchDepartments();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Error", description: err?.message || "Failed to duplicate department", variant: "destructive" });
    }
  };

  const handleArchive = async (department: Department) => {
    try {
      await deleteDepartment(department.id, false);
      toast({ title: "Success", description: "Department archived successfully" });
      fetchDepartments();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Error", description: err?.message || "Failed to archive department", variant: "destructive" });
    }
  };

  const handleRestore = async (department: Department) => {
    try {
      await updateDepartment(department.id, { is_active: true });
      toast({ title: "Success", description: "Department restored successfully" });
      fetchDepartments();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Error", description: err?.message || "Failed to restore department", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDepartments.size === 0) return;
    try {
      await Promise.all(Array.from(selectedDepartments).map((id) => deleteDepartment(id, false)));
      toast({ title: "Success", description: `${selectedDepartments.size} department(s) archived successfully` });
      setSelectedDepartments(new Set());
      fetchDepartments();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Error", description: err?.message || "Failed to archive departments", variant: "destructive" });
    }
  };

  const handleSelectAll = () => {
    const list = activeTab === "deactivated" ? paginatedDeactivatedDepartments : paginatedDepartments;
    if (selectedDepartments.size === list.length) {
      setSelectedDepartments(new Set());
    } else {
      setSelectedDepartments(new Set(list.map((d) => d.id)));
    }
  };

  const handleSelectDepartment = (id: string) => {
    const newSelected = new Set(selectedDepartments);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedDepartments(newSelected);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Description", "Manager", "Parent Department", "Budget", "Employees", "Status", "Created At"];
    const rows = departments.map((dept) => [
      dept.name,
      dept.description || "",
      dept.manager?.full_name || "",
      dept.parent_department?.name || "",
      (dept.budget || 0).toString(),
      (dept._count?.team_assignments || 0).toString(),
      dept.is_active ? "Active" : "Inactive",
      new Date(dept.created_at).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `departments_${new Date().toISOString().split("T")[0]}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: "Departments exported to CSV successfully" });
  };

  const stats = useMemo(() => {
    const s = apiStats ?? { active: 0, inactive: 0, totalBudget: 0, totalEmployees: 0 };
    const active = s.active;
    const inactive = s.inactive;
    const total = active + inactive;
    const totalBudget = s.totalBudget;
    const totalEmployees = s.totalEmployees;
    const avgBudget = active > 0 ? totalBudget / active : 0;
    const avgEmployees = active > 0 ? totalEmployees / active : 0;
    return {
      active,
      inactive,
      total,
      totalBudget: Number(totalBudget.toFixed(2)),
      totalEmployees,
      avgBudget: Number(avgBudget.toFixed(2)),
      avgEmployees: Number(avgEmployees.toFixed(1)),
      departmentsWithManager: 0,
      departmentsWithParent: 0,
    };
  }, [apiStats]);

  const searchAndFiltersBar = (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={activeTab === "deactivated" ? "Search deactivated departments..." : "Search departments..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      <div className="flex items-center gap-2">
        <Button variant={viewMode === "cards" ? "default" : "outline"} size="sm" onClick={() => setViewMode("cards")}>
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>
          <Table2 className="h-4 w-4" />
        </Button>
        <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const tablePaginationProps = {
    currentPage,
    pageSize,
    totalPages: activeTab === "deactivated" ? totalDeactivatedPages : totalPages,
    totalCount: listTotal,
    onPageChange: setCurrentPage,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
  };

  const actionsProps = {
    onViewDetails: handleViewDetails,
    onViewEmployees: handleViewEmployees,
    onViewProjects: handleViewProjects,
    onViewAttendance: handleViewAttendance,
    onViewPayroll: handleViewPayroll,
    onEdit: handleEdit,
    onDuplicate: handleDuplicate,
    onArchive: handleArchive,
    onRestore: handleRestore,
    onDelete: handleDelete,
  };

  if (!isAdmin && !isHR) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">You don&apos;t have permission to access department management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Department Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage organizational structure and team assignments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && selectedDepartments.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="whitespace-nowrap">
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Archive Selected</span>
              <span className="sm:hidden">Archive</span>
              <span className="ml-1">({selectedDepartments.size})</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportToCSV} className="whitespace-nowrap">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
          {isAdmin && (
            <Button onClick={() => { setSelectedDepartment(null); setShowDepartmentForm(true); }} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Department</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </div>

      <DepartmentStatsCards stats={stats} />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          {isAdmin && <TabsTrigger value="deactivated">Deactivated ({stats.inactive})</TabsTrigger>}
          {(isAdmin || isHR) && <TabsTrigger value="assignments">Team Assignments</TabsTrigger>}
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          {searchAndFiltersBar}
          {showFilters && (
            <DepartmentFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterManager={filterManager}
              setFilterManager={setFilterManager}
              filterParent={filterParent}
              setFilterParent={setFilterParent}
              minBudget={minBudget}
              setMinBudget={setMinBudget}
              maxBudget={maxBudget}
              setMaxBudget={setMaxBudget}
              managers={managers}
              parentDepartments={parentDepartments}
              includeStatusFilter
            />
          )}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p>Loading departments...</p>
              </CardContent>
            </Card>
          ) : activeTab === "departments" && listTotal === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No departments found</p>
              </CardContent>
            </Card>
          ) : viewMode === "table" ? (
            <DepartmentTable
              departments={paginatedDepartments}
              isAdmin={isAdmin}
              selectedDepartments={selectedDepartments}
              onSelectAll={handleSelectAll}
              onSelectDepartment={handleSelectDepartment}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              {...tablePaginationProps}
              {...actionsProps}
            />
          ) : viewMode === "list" ? (
            <DepartmentListView
              departments={paginatedDepartments}
              isAdmin={isAdmin}
              selectedDepartments={selectedDepartments}
              onSelectDepartment={handleSelectDepartment}
              {...tablePaginationProps}
              {...actionsProps}
            />
          ) : (
            <DepartmentCardView
              departments={paginatedDepartments}
              isAdmin={isAdmin}
              {...tablePaginationProps}
              {...actionsProps}
            />
          )}
        </TabsContent>

        <TabsContent value="deactivated" className="space-y-4">
          {searchAndFiltersBar}
          {showFilters && (
            <DepartmentFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterManager={filterManager}
              setFilterManager={setFilterManager}
              filterParent={filterParent}
              setFilterParent={setFilterParent}
              minBudget={minBudget}
              setMinBudget={setMinBudget}
              maxBudget={maxBudget}
              setMaxBudget={setMaxBudget}
              managers={managers}
              parentDepartments={parentDepartments}
              includeStatusFilter={false}
            />
          )}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p>Loading deactivated departments...</p>
              </CardContent>
            </Card>
          ) : activeTab === "deactivated" && listTotal === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No deactivated departments found</p>
              </CardContent>
            </Card>
          ) : viewMode === "table" ? (
            <DepartmentTable
              departments={paginatedDeactivatedDepartments}
              isAdmin={isAdmin}
              selectedDepartments={selectedDepartments}
              onSelectAll={handleSelectAll}
              onSelectDepartment={handleSelectDepartment}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              {...tablePaginationProps}
              countLabel="deactivated departments"
              {...actionsProps}
              isDeactivated
            />
          ) : viewMode === "list" ? (
            <DepartmentListView
              departments={paginatedDeactivatedDepartments}
              isAdmin={isAdmin}
              selectedDepartments={selectedDepartments}
              onSelectDepartment={handleSelectDepartment}
              {...tablePaginationProps}
              countLabel="deactivated departments"
              {...actionsProps}
              isDeactivated
            />
          ) : (
            <DepartmentCardView
              departments={paginatedDeactivatedDepartments}
              isAdmin={isAdmin}
              {...tablePaginationProps}
              countLabel="deactivated departments"
              {...actionsProps}
              isDeactivated
            />
          )}
        </TabsContent>

        <TabsContent value="assignments">
          <TeamAssignmentPanel />
        </TabsContent>

        <TabsContent value="hierarchy">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Department Hierarchy</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Visual representation of your organizational structure</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDepartments}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DepartmentHierarchyView
                  departments={departments}
                  expandedDepartments={expandedDepartments}
                  setExpandedDepartments={setExpandedDepartments}
                  departmentMembers={departmentMembers}
                  setDepartmentMembers={setDepartmentMembers}
                  onDepartmentClick={(dept) => handleViewDetails(dept)}
                  db={db}
                  onRefresh={fetchDepartments}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DepartmentDetailsDialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open);
          if (!open) {
            setDepartmentEmployees([]);
            setSelectedDepartment(null);
          }
        }}
        department={selectedDepartment}
        employees={departmentEmployees}
        loadingEmployees={loadingEmployees}
        onViewEmployees={handleViewEmployees}
        onViewProjects={handleViewProjects}
        onViewAttendance={handleViewAttendance}
        onViewPayroll={handleViewPayroll}
      />

      <DepartmentFormDialog
        open={showDepartmentForm}
        onOpenChange={setShowDepartmentForm}
        department={selectedDepartment ?? undefined}
        onDepartmentSaved={() => {
          setShowDepartmentForm(false);
          setSelectedDepartment(null);
          fetchDepartments();
        }}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedDepartment(null);
        }}
        onDeleted={fetchDepartments}
        itemType="Department"
        itemName={selectedDepartment?.name || ""}
        itemId={selectedDepartment?.id || ""}
        tableName="departments"
        softDelete={false}
        description="This will permanently delete the department. This action cannot be undone."
        onConfirm={async (softDelete) => {
          if (selectedDepartment) await deleteDepartment(selectedDepartment.id, !softDelete);
        }}
      />
    </div>
  );
}
