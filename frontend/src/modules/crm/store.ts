import { create } from 'zustand';

interface CrmState {
  // module-level client state
}

export const useCrmStore = create<CrmState>()(() => ({}));
