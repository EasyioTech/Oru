import { create } from 'zustand';

interface CoreState {
  // module-level client state
}

export const useCoreStore = create<CoreState>()(() => ({}));
