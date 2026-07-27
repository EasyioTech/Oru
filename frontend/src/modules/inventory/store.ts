import { create } from 'zustand';

interface InventoryState {
  // module-level client state
}

export const useInventoryStore = create<InventoryState>()(() => ({}));
