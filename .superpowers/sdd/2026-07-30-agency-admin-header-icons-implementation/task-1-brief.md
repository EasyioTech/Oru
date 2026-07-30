# Task 1: Create Zustand Dashboard Store (Favorites + Preferences + Health)

**Files:**
- Create: `frontend/src/modules/core/stores/dashboardStore.ts`

**Interfaces:**
- Produces: 
  - `dashboardStore.favorites: Favorite[]` (read/write)
  - `dashboardStore.addFavorite(favorite: Favorite): void`
  - `dashboardStore.removeFavorite(id: string): void`
  - `dashboardStore.preferences: UserPreferences` (read/write)
  - `dashboardStore.updatePreference(key: string, value: any): void`
  - `dashboardStore.healthAlerts: HealthAlert[]` (read/write)

**Types:**
```typescript
export interface Favorite {
  id: string;
  type: 'report' | 'team' | 'client';
  title: string;
  url: string;
  icon?: string;
  timestamp: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  density: 'compact' | 'normal';
  notificationFrequency: 'daily' | 'weekly' | 'never';
  defaultFilters?: Record<string, any>;
  dashboardRefreshInterval: number; // milliseconds
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  relatedUrl?: string;
}
```

**Complete Implementation:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Favorite {
  id: string;
  type: 'report' | 'team' | 'client';
  title: string;
  url: string;
  icon?: string;
  timestamp: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  density: 'compact' | 'normal';
  notificationFrequency: 'daily' | 'weekly' | 'never';
  defaultFilters?: Record<string, any>;
  dashboardRefreshInterval: number;
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  relatedUrl?: string;
}

interface DashboardStore {
  favorites: Favorite[];
  preferences: UserPreferences;
  healthAlerts: HealthAlert[];
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (id: string) => void;
  updatePreference: (key: keyof UserPreferences, value: any) => void;
  setHealthAlerts: (alerts: HealthAlert[]) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  density: 'normal',
  notificationFrequency: 'daily',
  dashboardRefreshInterval: 30000,
};

export const dashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      favorites: [],
      preferences: defaultPreferences,
      healthAlerts: [],
      
      addFavorite: (favorite: Favorite) =>
        set((state) => {
          const filtered = state.favorites.filter((f) => f.id !== favorite.id);
          if (filtered.length >= 15) filtered.shift(); // FIFO cap
          return { favorites: [...filtered, favorite] };
        }),
      
      removeFavorite: (id: string) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
      
      updatePreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
      
      setHealthAlerts: (alerts) => set({ healthAlerts: alerts }),
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        favorites: state.favorites,
        preferences: state.preferences,
      }),
    }
  )
);

export default dashboardStore;
```

**Steps (copied from plan):**
- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/stores/dashboardStore.ts`
- [ ] **Step 2:** Verify TypeScript compilation: `npm run tsc --noEmit` (from frontend dir)
- [ ] **Step 3:** Commit

**Commit message:**
```
feat: create Zustand dashboard store (favorites, preferences, health alerts)
```

**Success criteria:**
- File created at correct path
- TypeScript compiles with no errors
- Exports all interfaces and store correctly
- localStorage middleware configured
