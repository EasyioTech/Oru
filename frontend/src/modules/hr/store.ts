import { create } from 'zustand';

interface HrState {
  // module-level client state
}

export const useHrStore = create<HrState>()(() => ({}));
