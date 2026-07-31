import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDetails } from "../project-details/hooks/useProjectDetails";
import { useProjectForm } from "@/components/shared/project-form/useProjectForm";
import { BasicInfoSection } from "@/components/shared/project-form/sections/BasicInfoSection";
import { ClientManagerSection } from "@/components/shared/project-form/sections/ClientManagerSection";
import { TeamDeptSection } from "@/components/shared/project-form/sections/TeamDeptSection";
import { TimelineSection } from "@/components/shared/project-form/sections/TimelineSection";
import { BudgetSection } from "@/components/shared/project-form/sections/BudgetSection";
import { TagsCategoriesSection } from "@/components/shared/project-form/sections/TagsCategoriesSection";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, loading, loadProject } = useProjectDetails(id);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id, loadProject]);

  const ctx = useProjectForm(
    project,
    true,
    () => navigate(-1),
    () => navigate("/projects")
  );

  if (id && loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl space-y-6 lg:space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-muted/50 rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            {id ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            {id
              ? "Update the details of your project below."
              : "Set up a new project by providing the details below."}
          </p>
        </div>
      </div>

      <form onSubmit={ctx.handleSubmit} className="space-y-6 lg:space-y-8 pb-12">
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-0 sm:p-6 lg:p-8">
            <BasicInfoSection formData={ctx.formData} setFormData={ctx.setFormData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-4">
                Client & Team Assignment
              </h3>
              <div className="space-y-6">
                <ClientManagerSection ctx={ctx} />
                <div className="border-t border-border/30 pt-6">
                  <TeamDeptSection ctx={ctx} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-0 sm:p-6 lg:p-8">
            <TimelineSection formData={ctx.formData} setFormData={ctx.setFormData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-0 sm:p-6 lg:p-8">
            <BudgetSection formData={ctx.formData} setFormData={ctx.setFormData} isEditing={!!id} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <TagsCategoriesSection ctx={ctx} />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto h-11 px-8 text-sm lg:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={ctx.loading}
            className="w-full sm:w-auto h-11 px-8 text-sm lg:text-base font-semibold"
          >
            {ctx.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : id ? (
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
