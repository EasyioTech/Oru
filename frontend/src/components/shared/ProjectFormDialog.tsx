import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectForm } from './project-form/useProjectForm';
import { type ProjectFormDialogProps } from './project-form/types';
import { BasicInfoSection } from './project-form/sections/BasicInfoSection';
import { ClientManagerSection } from './project-form/sections/ClientManagerSection';
import { TeamDeptSection } from './project-form/sections/TeamDeptSection';
import { TimelineSection } from './project-form/sections/TimelineSection';
import { BudgetSection } from './project-form/sections/BudgetSection';
import { TagsCategoriesSection } from './project-form/sections/TagsCategoriesSection';

const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({ isOpen, onClose, project, onProjectSaved }) => {
  const ctx = useProjectForm(project, isOpen, onClose, onProjectSaved);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{project?.id ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {project?.id ? 'Update project details below.' : 'Fill in the details to create a new project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={ctx.handleSubmit} className="space-y-4">
          <BasicInfoSection formData={ctx.formData} setFormData={ctx.setFormData} />

          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm">Client & Team Assignment</h3>
            <ClientManagerSection ctx={ctx} />
            <TeamDeptSection ctx={ctx} />
          </div>

          <TimelineSection formData={ctx.formData} setFormData={ctx.setFormData} />
          <BudgetSection formData={ctx.formData} setFormData={ctx.setFormData} isEditing={!!project?.id} />
          <TagsCategoriesSection ctx={ctx} />

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={ctx.loading} className="w-full sm:w-auto">
              {ctx.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : project?.id ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
