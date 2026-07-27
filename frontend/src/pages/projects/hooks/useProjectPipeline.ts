import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project, PIPELINE_STAGES } from '../utils/projectUtils';
import { useToast } from '@/hooks/use-toast';

export const useProjectPipeline = (projects: Project[], onProjectsUpdated: () => void) => {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const projectsByStatus = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage.status] = projects.filter(project => {
        const normalizedStatus = project.status === 'in_progress' ? 'in-progress' : 
                                project.status === 'on_hold' ? 'on-hold' : project.status;
        return normalizedStatus === stage.status;
      });
      return acc;
    }, {} as Record<string, Project[]>);
  }, [projects]);

  const { mutateAsync: handleProjectStatusChange } = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const dbStatus = status === 'in-progress' ? 'in_progress' : 
                      status === 'on-hold' ? 'on_hold' : status;
      await api.put(`/projects/${id}`, { status: dbStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onProjectsUpdated();
      toast({ title: 'Success', description: 'Project status updated successfully' });
    }
  });

  return {
    projectsByStatus,
    draggedProject,
    onDragStart: (e: React.DragEvent, id: string) => {
      setDraggedProject(id);
      e.dataTransfer.setData('text/plain', id);
    },
    onDragEnd: () => setDraggedProject(null),
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDragLeave: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent, status: string) => {
      e.preventDefault();
      const projectId = e.dataTransfer.getData('text/plain');
      if (projectId) {
        handleProjectStatusChange({ id: projectId, status });
      }
      setDraggedProject(null);
    },
  };
};
