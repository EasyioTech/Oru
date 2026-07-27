import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson, fetchMutate } from '@/utils/authApi';

// ─── Projects ─────────────────────────────────────────────────────────────────

export const useProjects = (filters?: { status?: string; clientId?: string; search?: string }) =>
  useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      return fetchJson(`/projects${query ? `?${query}` : ''}`);
    },
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchJson(`/projects/${id}`),
    enabled: !!id,
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate('/projects', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      fetchMutate(`/projects/${id}`, 'PUT', data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchMutate(`/projects/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const useTasks = (projectId: string) =>
  useQuery({
    queryKey: ['project_tasks', projectId],
    queryFn: () => fetchJson(`/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => fetchMutate(`/projects/${projectId}/tasks`, 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project_tasks', projectId] }),
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId, data }: { id: string; projectId: string; data: unknown }) =>
      fetchMutate(`/projects/tasks/${id}`, 'PUT', data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project_tasks', projectId] });
    },
  });
};
