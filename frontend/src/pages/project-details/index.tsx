/**
 * Project Details Page
 * Full project view with tasks, team, timeline, budget, and resources
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ProjectFormDialog from "@/components/shared/ProjectFormDialog";
import { TaskKanbanBoard } from "@/components/project-management/TaskKanbanBoard";

// Hooks
import { useProjectDetails } from "./hooks/useProjectDetails";
import { useProjectTasks } from "./hooks/useProjectTasks";
import { useProjectIntegration } from "./hooks/useProjectIntegration";
import { useProjectMetrics } from "./hooks/useProjectMetrics";

// Components
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectMetrics } from "./components/ProjectMetrics";
import { OverviewTab } from "./components/OverviewTab";
import { TeamTab } from "./components/TeamTab";
import { TimelineTab } from "./components/TimelineTab";
import { BudgetTab } from "./components/BudgetTab";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { project, loading, loadProject } = useProjectDetails(id);
  const { tasks, loadTasks } = useProjectTasks(id);
  const {
    clientDetails,
    teamMembers,
    departments,
    invoices,
    revenue,
    loading: loadingIntegration,
    loadIntegrationData,
  } = useProjectIntegration(project);
  
  const metrics = useProjectMetrics(project, tasks);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
    }
  }, [id, loadProject, loadTasks]);

  useEffect(() => {
    if (project) {
      loadIntegrationData();
    }
  }, [project, loadIntegrationData]);

  const handleProjectSaved = () => {
    loadProject();
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Project not found</p>
            <Button onClick={() => navigate('/project-management')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProjectHeader
        project={project}
        onBack={() => navigate('/project-management')}
        onEdit={() => setShowEditForm(true)}
      />

      <ProjectMetrics
        project={project}
        completedTasks={metrics.completedTasks}
        totalTasks={metrics.totalTasks}
        taskCompletionRate={metrics.taskCompletionRate}
        budgetVariance={metrics.budgetVariance}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            project={project}
            tasks={tasks}
            taskCompletionRate={metrics.taskCompletionRate}
            completedTasks={metrics.completedTasks}
            totalTasks={metrics.totalTasks}
            revenue={revenue}
            clientDetails={clientDetails}
            onNavigate={navigate}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskKanbanBoard projectId={id} />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamTab
            teamMembers={teamMembers}
            departments={departments}
            loading={loadingIntegration}
            onNavigate={navigate}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <TimelineTab project={project} />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetTab
            project={project}
            revenue={revenue}
            invoices={invoices}
            onNavigate={navigate}
          />
        </TabsContent>
      </Tabs>

      {showEditForm && (
        <ProjectFormDialog
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          project={project}
          onProjectSaved={handleProjectSaved}
        />
      )}
    </div>
  );
}
