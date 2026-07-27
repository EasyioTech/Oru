import { create } from 'zustand';

interface ReportsState {
  // module-level client state
}

export const useReportsStore = create<ReportsState>()(() => ({}));
