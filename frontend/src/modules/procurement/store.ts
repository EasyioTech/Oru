import { create } from 'zustand';

interface ProcurementState {
  // module-level client state
}

export const useProcurementStore = create<ProcurementState>()(() => ({}));
