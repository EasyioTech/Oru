import { create } from 'zustand';

interface ProjectsState {
  // module-level client state
}

export const useProjectsStore = create<ProjectsState>()(() => ({}));
