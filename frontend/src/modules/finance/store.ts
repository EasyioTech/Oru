import { create } from 'zustand';

interface FinanceState {
  // module-level client state
}

export const useFinanceStore = create<FinanceState>()(() => ({}));
