import { create } from 'zustand';

interface AdminState {
  // module-level client state
}

export const useAdminStore = create<AdminState>()(() => ({}));
