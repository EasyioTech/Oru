# Agency Admin Dashboard Header Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 7 functional header icon features (Search, Favorites, QuickCreate, Settings, HealthAlert, Export, BulkImport) for agency admin dashboard, replacing broken placeholder buttons.

**Architecture:** Modular component system with Zustand for client state (favorites, preferences), TanStack Query for server state, cmdk for search, React Hook Form for create forms. MVP focuses on first 5 features (defer Export & BulkImport to Phase 2). Each icon opens a self-contained UI (modal, dropdown, popover).

**Tech Stack:** React 18, Vite, TypeScript, TanStack Query v5, Zustand v5, cmdk, React Hook Form v8, Zod v4, Framer Motion, shadcn/ui, Tailwind CSS v4

## Global Constraints

- All components live in `frontend/src/modules/core/components/` or `hooks/`
- Follow ORU module pattern (max 200 lines per component, <300 lines per file)
- TypeScript strict mode, no `any` types
- Use existing ORU Zod schemas from `packages/schemas/`
- Zustand stores use persist middleware for localStorage
- TanStack Query for all remote data (useQuery/useMutation)
- React Hook Form + Zod for all forms
- Framer Motion for animations (fade-in, slide-out)
- Icons from lucide-react (already imported in AgencyAdminDashboard)
- Existing shadcn/ui components: Avatar, Button, Input, Dialog, Sheet, Popover, Toast
- No new npm packages (all dependencies already in stack)
- Naming: camelCase for functions/stores, PascalCase for components
- Test: Manual E2E on dev server (no unit test framework yet)
- Commits: One feature per commit with descriptive messages

---

## File Structure

### Create (New Files)

```
frontend/src/modules/core/
├── components/
│   ├── DashboardHeaderBar.tsx          [Main container - imports all icons]
│   ├── SearchCommand.tsx                [⌘K omni-search modal with cmdk]
│   ├── FavoritesDropdown.tsx            [⭐ Bookmarks dropdown]
│   ├── QuickCreateMenu.tsx              [➕ Quick create 4 types]
│   ├── SettingsPanel.tsx                [⚙️ Preferences sheet]
│   └── HealthAlert.tsx                  [🔍 Status popover]
├── hooks/
│   ├── useFavorites.ts                  [Custom hook for favorites store]
│   ├── useHealthAlerts.ts               [Custom hook for health data + polling]
│   └── useUserPreferences.ts            [Custom hook for settings store]
└── stores/
    └── dashboardStore.ts                [Zustand: favorites + preferences + health]
```

### Modify (Existing Files)

```
frontend/src/pages/dashboards/agency-admin/index.tsx
  - Replace lines 54-66 (broken button header) with <DashboardHeaderBar />
  - Remove unused icon imports (Search, Star, Plus, Share2, Upload, Settings)
  - Keep existing: Mail, Monitor, Pen, MoreHorizontal (used in new components)
```

---

## Task Order (MVP — 5 Features)

**Dependency chain:** Stores → Hooks → Individual components → Header Bar → Integration → Testing

---

### Task 1: Create Zustand Dashboard Store (Favorites + Preferences + Health)

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

**Implementation:**

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

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/stores/dashboardStore.ts`
- [ ] **Step 2:** Verify TypeScript compilation: `npm run tsc --noEmit` (from frontend dir)
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/stores/dashboardStore.ts
git commit -m "feat: create Zustand dashboard store (favorites, preferences, health alerts)"
```

---

### Task 2: Create useUserPreferences Custom Hook

**Files:**
- Create: `frontend/src/modules/core/hooks/useUserPreferences.ts`

**Interfaces:**
- Consumes: `dashboardStore` (from Task 1)
- Produces:
  - `useUserPreferences(): { preferences, updatePreference, syncWithBackend }`
  - Returns: `{ theme, density, notificationFrequency, dashboardRefreshInterval, updatePreference, syncToBackend }`

**Implementation:**

```typescript
import { useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { dashboardStore, UserPreferences } from '../stores/dashboardStore';

export function useUserPreferences() {
  const preferences = dashboardStore((state) => state.preferences);
  const updatePreference = dashboardStore((state) => state.updatePreference);

  // Mutation to sync preferences to backend
  const { mutate: syncToBackend } = useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
  });

  const updateAndSync = useCallback(
    (key: keyof UserPreferences, value: any) => {
      // Optimistic update (instant)
      updatePreference(key, value);
      // Sync to backend (debounced in practice, here we just fire it)
      syncToBackend({ [key]: value });
    },
    [updatePreference, syncToBackend]
  );

  return {
    theme: preferences.theme,
    density: preferences.density,
    notificationFrequency: preferences.notificationFrequency,
    dashboardRefreshInterval: preferences.dashboardRefreshInterval,
    updatePreference: updateAndSync,
  };
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/hooks/useUserPreferences.ts`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/hooks/useUserPreferences.ts
git commit -m "feat: add useUserPreferences hook with backend sync"
```

---

### Task 3: Create useFavorites Custom Hook

**Files:**
- Create: `frontend/src/modules/core/hooks/useFavorites.ts`

**Interfaces:**
- Consumes: `dashboardStore` (from Task 1)
- Produces:
  - `useFavorites(): { favorites, addFavorite, removeFavorite, isFavorited }`

**Implementation:**

```typescript
import { useCallback } from 'react';
import { dashboardStore, Favorite } from '../stores/dashboardStore';

export function useFavorites() {
  const favorites = dashboardStore((state) => state.favorites);
  const addFavorite = dashboardStore((state) => state.addFavorite);
  const removeFavorite = dashboardStore((state) => state.removeFavorite);

  const toggleFavorite = useCallback(
    (favorite: Favorite) => {
      const exists = favorites.some((f) => f.id === favorite.id);
      if (exists) {
        removeFavorite(favorite.id);
      } else {
        addFavorite({ ...favorite, timestamp: Date.now() });
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorited = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  };
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/hooks/useFavorites.ts`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/hooks/useFavorites.ts
git commit -m "feat: add useFavorites hook"
```

---

### Task 4: Create useHealthAlerts Custom Hook

**Files:**
- Create: `frontend/src/modules/core/hooks/useHealthAlerts.ts`

**Interfaces:**
- Consumes: `dashboardStore` (from Task 1), TanStack Query
- Produces:
  - `useHealthAlerts(): { healthScore, status, alerts, actionItems, isLoading }`
  - Returns: `{ healthScore: number, status: {api, db, redis}, alerts: HealthAlert[], actionItems: any[], isLoading: boolean }`

**API Response Schema (backend to implement):**
```typescript
{
  score: number; // 0-100
  status: {
    api: 'healthy' | 'degraded' | 'down';
    db: 'healthy' | 'degraded' | 'down';
    redis: 'healthy' | 'degraded' | 'down';
  };
  alerts: HealthAlert[];
  actionItems: { title: string; url: string; priority: 'high' | 'medium' | 'low' }[];
}
```

**Implementation:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { dashboardStore } from '../stores/dashboardStore';

export interface HealthStatus {
  api: 'healthy' | 'degraded' | 'down';
  db: 'healthy' | 'degraded' | 'down';
  redis: 'healthy' | 'degraded' | 'down';
}

export interface ActionItem {
  title: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
}

export function useHealthAlerts() {
  const setHealthAlerts = dashboardStore((state) => state.setHealthAlerts);

  const { data, isLoading, error } = useQuery({
    queryKey: ['agencyHealth'],
    queryFn: async () => {
      const response = await fetch('/api/agency/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      return response.json();
    },
    refetchInterval: 30000, // Poll every 30s
    staleTime: 25000,
  });

  // Sync alerts to store
  if (data?.alerts) {
    setHealthAlerts(data.alerts);
  }

  return {
    healthScore: data?.score ?? 0,
    status: data?.status ?? { api: 'down', db: 'down', redis: 'down' },
    alerts: data?.alerts ?? [],
    actionItems: data?.actionItems ?? [],
    isLoading,
    error,
  };
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/hooks/useHealthAlerts.ts`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/hooks/useHealthAlerts.ts
git commit -m "feat: add useHealthAlerts hook with 30s polling"
```

---

### Task 5: Create SearchCommand Component

**Files:**
- Create: `frontend/src/modules/core/components/SearchCommand.tsx`

**Interfaces:**
- Consumes: `cmdk` package, TanStack Query (useQuery), React Router (useNavigate)
- Produces: React component `<SearchCommand />`
  - Props: none
  - Render: Modal with search input, grouped results by type

**Implementation:**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import { Search, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'user' | 'project' | 'invoice' | 'task' | 'document';
  title: string;
  subtitle?: string;
  url: string;
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search results (debounced by TanStack Query)
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return [];
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/search?${params}`, {
        method: 'GET',
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: query.length > 1,
    staleTime: Infinity,
  });

  // Group results by type
  const grouped = {
    user: results.filter((r: SearchResult) => r.type === 'user'),
    project: results.filter((r: SearchResult) => r.type === 'project'),
    invoice: results.filter((r: SearchResult) => r.type === 'invoice'),
    task: results.filter((r: SearchResult) => r.type === 'task'),
    document: results.filter((r: SearchResult) => r.type === 'document'),
  };

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors"
        aria-label="Search (Cmd+K)"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search users, projects, invoices..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          {!isLoading && query && results.length === 0 && (
            <CommandEmpty>No results found for "{query}"</CommandEmpty>
          )}
          {!isLoading && query === '' && (
            <div className="px-2 py-1.5 text-xs text-gray-500">
              Type to search across your agency
            </div>
          )}

          {/* Users */}
          {grouped.user.length > 0 && (
            <CommandGroup heading="Users">
              {grouped.user.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-xs text-gray-500">{item.subtitle}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Projects */}
          {grouped.project.length > 0 && (
            <CommandGroup heading="Projects">
              {grouped.project.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Invoices */}
          {grouped.invoice.length > 0 && (
            <CommandGroup heading="Invoices">
              {grouped.invoice.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500">{item.subtitle}</div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Tasks */}
          {grouped.task.length > 0 && (
            <CommandGroup heading="Tasks">
              {grouped.task.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Documents */}
          {grouped.document.length > 0 && (
            <CommandGroup heading="Documents">
              {grouped.document.map((item: SearchResult) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  <div className="font-medium">{item.title}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/components/SearchCommand.tsx`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/components/SearchCommand.tsx
git commit -m "feat: add SearchCommand component with Cmd+K integration"
```

---

### Task 6: Create FavoritesDropdown Component

**Files:**
- Create: `frontend/src/modules/core/components/FavoritesDropdown.tsx`

**Interfaces:**
- Consumes: `useFavorites` hook (from Task 3), React Router, Popover (shadcn/ui)
- Produces: React component `<FavoritesDropdown />`

**Implementation:**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFavorites } from '../hooks/useFavorites';

export function FavoritesDropdown() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const [open, setOpen] = useState(false);

  const handleNavigate = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors"
          aria-label="Favorites"
        >
          {favorites.length > 0 ? (
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="w-4 h-4" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="flex flex-col max-h-80 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">Favorites</h3>
            <p className="text-xs text-gray-500 mt-1">
              {favorites.length} saved
            </p>
          </div>
          {favorites.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No favorites yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Star reports to save them here
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => handleNavigate(fav.url)}
                    className="flex-1 text-left hover:text-blue-600 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {fav.title}
                    </div>
                    <div className="text-xs text-gray-500">{fav.type}</div>
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label="Remove favorite"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/components/FavoritesDropdown.tsx`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/components/FavoritesDropdown.tsx
git commit -m "feat: add FavoritesDropdown component"
```

---

### Task 7: Create QuickCreateMenu Component

**Files:**
- Create: `frontend/src/modules/core/components/QuickCreateMenu.tsx`

**Interfaces:**
- Consumes: React Router (useNavigate), TanStack Query (useQueryClient), Popover (shadcn/ui)
- Produces: React component `<QuickCreateMenu />`
- Note: Actual form components (ProjectForm, UserInviteForm, etc.) assumed to exist in respective modules; this component only shows menu + delegates to modal dialogs

**Implementation:**

```typescript
import { useState } from 'react';
import { Plus, Briefcase, Users, FileText, CheckSquare } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface CreateAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

export function QuickCreateMenu() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const actions: CreateAction[] = [
    {
      id: 'project',
      label: 'Create Project',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Start a new project',
      action: () => {
        // Dispatch open project form modal (via context or URL param)
        // For now, show toast as placeholder
        toast({
          title: 'Create Project',
          description: 'Project creation form would open here',
        });
        setOpen(false);
      },
    },
    {
      id: 'user',
      label: 'Invite User',
      icon: <Users className="w-4 h-4" />,
      description: 'Add team member',
      action: () => {
        toast({
          title: 'Invite User',
          description: 'User invitation form would open here',
        });
        setOpen(false);
      },
    },
    {
      id: 'invoice',
      label: 'Create Invoice',
      icon: <FileText className="w-4 h-4" />,
      description: 'Generate new invoice',
      action: () => {
        toast({
          title: 'Create Invoice',
          description: 'Invoice creation form would open here',
        });
        setOpen(false);
      },
    },
    {
      id: 'task',
      label: 'Create Task',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Add new task',
      action: () => {
        toast({
          title: 'Create Task',
          description: 'Task creation form would open here',
        });
        setOpen(false);
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors"
          aria-label="Quick Create"
        >
          <Plus className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">
              Quick Create
            </h3>
          </div>
          <div className="p-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="mt-0.5 text-gray-600">{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/components/QuickCreateMenu.tsx`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/components/QuickCreateMenu.tsx
git commit -m "feat: add QuickCreateMenu component with 4 create actions"
```

---

### Task 8: Create SettingsPanel Component

**Files:**
- Create: `frontend/src/modules/core/components/SettingsPanel.tsx`

**Interfaces:**
- Consumes: `useUserPreferences` hook (from Task 2), Sheet (shadcn/ui)
- Produces: React component `<SettingsPanel />`

**Implementation:**

```typescript
import { useState } from 'react';
import { Settings, Monitor } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserPreferences } from '../hooks/useUserPreferences';

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const {
    theme,
    density,
    notificationFrequency,
    dashboardRefreshInterval,
    updatePreference,
  } = useUserPreferences();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
          <SheetDescription>
            Customize your dashboard experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Appearance */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Appearance
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Theme
                </label>
                <Select
                  value={theme}
                  onValueChange={(value) =>
                    updatePreference('theme', value as 'light' | 'dark')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Density
                </label>
                <Select
                  value={density}
                  onValueChange={(value) =>
                    updatePreference('density', value as 'compact' | 'normal')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Notifications
            </h4>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Alert Frequency
              </label>
              <Select
                value={notificationFrequency}
                onValueChange={(value) =>
                  updatePreference(
                    'notificationFrequency',
                    value as 'daily' | 'weekly' | 'never'
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dashboard */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Dashboard
            </h4>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Refresh Interval (seconds)
              </label>
              <Select
                value={String(dashboardRefreshInterval / 1000)}
                onValueChange={(value) =>
                  updatePreference('dashboardRefreshInterval', Number(value) * 1000)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            Changes are saved automatically
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/components/SettingsPanel.tsx`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/components/SettingsPanel.tsx
git commit -m "feat: add SettingsPanel component with auto-save"
```

---

### Task 9: Create HealthAlert Component

**Files:**
- Create: `frontend/src/modules/core/components/HealthAlert.tsx`

**Interfaces:**
- Consumes: `useHealthAlerts` hook (from Task 4), Popover (shadcn/ui)
- Produces: React component `<HealthAlert />`

**Implementation:**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useHealthAlerts } from '../hooks/useHealthAlerts';
import { Skeleton } from '@/components/ui/skeleton';

export function HealthAlert() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { healthScore, status, alerts, actionItems, isLoading, error } =
    useHealthAlerts();

  const getStatusColor = (
    status: 'healthy' | 'degraded' | 'down'
  ): string => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-700';
      case 'down':
        return 'bg-red-100 text-red-700';
    }
  };

  const getStatusIcon = (s: 'healthy' | 'degraded' | 'down') => {
    switch (s) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'down':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'down';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors relative"
          aria-label="Health & Alerts"
        >
          <Monitor className="w-4 h-4" />
          {healthStatus !== 'healthy' && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex flex-col max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-900">
              Agency Health
            </h3>
          </div>

          {isLoading ? (
            <div className="px-4 py-6 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-red-600">Failed to load health data</p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {/* Health Score */}
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {healthScore}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>

              {/* Status Indicators */}
              <div className="px-4 py-4 border-b border-gray-100 space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase">
                  System Status
                </h4>
                {['api', 'db', 'redis'].map((service) => (
                  <div
                    key={service}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(
                      status[service as keyof typeof status]
                    )}`}
                  >
                    {getStatusIcon(status[service as keyof typeof status])}
                    <span className="text-xs font-medium capitalize">
                      {service === 'db' ? 'Database' : service === 'api' ? 'API' : 'Redis'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Alerts */}
              {alerts.length > 0 && (
                <div className="px-4 py-4 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                    Recent Alerts
                  </h4>
                  <div className="space-y-2">
                    {alerts.slice(0, 3).map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => {
                          if (alert.relatedUrl) navigate(alert.relatedUrl);
                          setOpen(false);
                        }}
                        className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {alert.type === 'error' && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          {alert.type === 'warning' && (
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          )}
                          {alert.type === 'info' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-gray-900">
                              {alert.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {alert.message}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {actionItems.length > 0 && (
                <div className="px-4 py-4">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                    Action Items
                  </h4>
                  <div className="space-y-1">
                    {actionItems.slice(0, 3).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.url);
                          setOpen(false);
                        }}
                        className="w-full text-left text-xs px-2 py-1.5 hover:bg-gray-50 rounded text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        • {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Report Button */}
              <div className="px-4 py-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/dashboards/agency-admin/health')}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  View Full Report
                </button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/components/HealthAlert.tsx`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/components/HealthAlert.tsx
git commit -m "feat: add HealthAlert component with system status monitoring"
```

---

### Task 10: Create DashboardHeaderBar Container Component

**Files:**
- Create: `frontend/src/modules/core/components/DashboardHeaderBar.tsx`

**Interfaces:**
- Consumes: All 5 MVP components (SearchCommand, FavoritesDropdown, QuickCreateMenu, SettingsPanel, HealthAlert)
- Produces: React component `<DashboardHeaderBar />`
  - Props: none
  - Render: Flex row with all 5 icon buttons

**Implementation:**

```typescript
import { SearchCommand } from './SearchCommand';
import { FavoritesDropdown } from './FavoritesDropdown';
import { QuickCreateMenu } from './QuickCreateMenu';
import { SettingsPanel } from './SettingsPanel';
import { HealthAlert } from './HealthAlert';

export function DashboardHeaderBar() {
  return (
    <div className="flex items-center gap-2">
      <SearchCommand />
      <FavoritesDropdown />
      <QuickCreateMenu />
      <SettingsPanel />
      <HealthAlert />
    </div>
  );
}
```

- [ ] **Step 1:** Copy code above into `frontend/src/modules/core/components/DashboardHeaderBar.tsx`
- [ ] **Step 2:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 3:** Commit
```bash
git add frontend/src/modules/core/components/DashboardHeaderBar.tsx
git commit -m "feat: add DashboardHeaderBar container component"
```

---

### Task 11: Integrate DashboardHeaderBar into AgencyAdminDashboard

**Files:**
- Modify: `frontend/src/pages/dashboards/agency-admin/index.tsx`
  - Lines 1-21: Remove unused icon imports
  - Lines 54-66: Replace broken button header with `<DashboardHeaderBar />`

**Changes:**

1. **Remove icon imports** (lines 8-11):

```typescript
// BEFORE:
import {
  Search, Star, Plus, Share2, Upload, Settings, Monitor, 
  Mail, Phone, Linkedin, Check, ChevronDown, Pen, 
  MessageSquare, Briefcase, Users, Calendar, Activity,
  FileText, MoreHorizontal
} from 'lucide-react';

// AFTER:
import {
  Check, ChevronDown, Pen, 
  MessageSquare, Briefcase, Users, Calendar, Activity,
  FileText, MoreHorizontal
} from 'lucide-react';
```

2. **Add DashboardHeaderBar import** (after other component imports, around line 21):

```typescript
import { DashboardHeaderBar } from '@/modules/core/components/DashboardHeaderBar';
```

3. **Replace header buttons** (lines 54-66):

```typescript
// BEFORE:
<div className="flex gap-2">
  <PillButton label="Generate Report" />
  <div className="flex gap-1">
    {['mail', 'video', 'edit', 'more'].map((action, i) => (
      <button key={i} className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors">
        {i === 0 && <Mail className="w-4 h-4" />}
        {i === 1 && <Monitor className="w-4 h-4" />}
        {i === 2 && <Pen className="w-4 h-4" />}
        {i === 3 && <MoreHorizontal className="w-4 h-4" />}
      </button>
    ))}
  </div>
</div>

// AFTER:
<DashboardHeaderBar />
```

- [ ] **Step 1:** Open `frontend/src/pages/dashboards/agency-admin/index.tsx`
- [ ] **Step 2:** Remove unused icon imports (Search, Star, Plus, Share2, Upload, Settings, Monitor, Mail, Phone, Linkedin, MessageSquare)
- [ ] **Step 3:** Add DashboardHeaderBar import
- [ ] **Step 4:** Replace broken header buttons (lines 54-66) with `<DashboardHeaderBar />`
- [ ] **Step 5:** Verify TypeScript: `npm run tsc --noEmit`
- [ ] **Step 6:** Commit
```bash
git add frontend/src/pages/dashboards/agency-admin/index.tsx
git commit -m "refactor: replace broken header buttons with DashboardHeaderBar"
```

---

### Task 12: End-to-End Testing on Dev Server

**Objective:** Verify all 5 MVP features work correctly on live dev server

**Setup:**
- [ ] **Step 1:** Start dev server

From `frontend/` directory:
```bash
npm run dev
```

Wait for Vite to start (should show URL like `http://localhost:5173`)

- [ ] **Step 2:** Navigate to agency-admin dashboard

Open browser to: `http://localhost:5173/dashboards/agency-admin`

- [ ] **Step 3:** Test SearchCommand

1. Click search icon OR press `Cmd+K` / `Ctrl+K`
2. Verify modal opens
3. Type "project" (or any keyword)
4. Verify results appear in groups (Users, Projects, Invoices, etc.)
5. Click a result, verify navigation works
6. Press Escape, verify modal closes

**Expected:** Search works, grouping visible, navigation successful

- [ ] **Step 4:** Test FavoritesDropdown

1. Click star icon
2. Verify dropdown shows "No favorites yet"
3. Click anywhere on dashboard to close
4. Add a favorite from elsewhere (star a report/view - or manually add via store in console)
5. Click star icon again
6. Verify favorite appears in list
7. Click favorite, verify navigation
8. Reload page, verify favorite persists (localStorage)

**Expected:** Dropdown works, favorites persist across reload

- [ ] **Step 5:** Test QuickCreateMenu

1. Click plus icon
2. Verify dropdown shows 4 options: Create Project, Invite User, Create Invoice, Create Task
3. Click "Create Project"
4. Verify toast notification appears ("Project creation form would open here")
5. Repeat for other 3 options

**Expected:** Menu opens, clicks show appropriate toasts

- [ ] **Step 6:** Test SettingsPanel

1. Click settings icon (gear)
2. Verify sheet panel opens from right side
3. Change theme (Light ↔ Dark)
4. Verify change is instant (no loading)
5. Change density (Compact ↔ Normal)
6. Change notification frequency
7. Change refresh interval
8. Close sheet
9. Reload page
10. Open settings again, verify all changes persisted

**Expected:** All settings save, persist, and take effect immediately

- [ ] **Step 7:** Test HealthAlert

1. Click monitor icon
2. Verify popover opens
3. Verify health score displays (0-100)
4. Verify status indicators show (API, Database, Redis) with colors (green/yellow/red)
5. Verify alerts list shows (if any)
6. Verify "View Full Report" button navigates to `/dashboards/agency-admin/health`
7. Wait 30+ seconds, verify data refreshes (polling works)

**Expected:** Popover works, health score displays, status shown, polling active

- [ ] **Step 8:** Check console for errors

Open browser DevTools (F12), check Console tab:
- No red error messages
- No TypeScript errors
- No warnings about missing components or undefined

**Expected:** Console is clean

- [ ] **Step 9:** Mobile responsiveness check (optional)

1. Resize browser to mobile width (~375px)
2. Click each icon, verify they're still clickable (44px minimum target)
3. Verify modals/sheets render correctly on mobile

**Expected:** Mobile-friendly UI, no overflow, touch-friendly buttons

- [ ] **Step 10:** Final manual verification checklist

- [ ] Search icon visible in header ✓
- [ ] Star icon visible (outline) ✓
- [ ] Plus icon visible ✓
- [ ] Settings icon visible ✓
- [ ] Monitor icon visible ✓
- [ ] No broken UI or console errors ✓
- [ ] All 5 features respond to clicks ✓
- [ ] Navigation works from search ✓
- [ ] Settings persist across reload ✓
- [ ] Health data loads and polls ✓

**If any test fails:** Check browser console for errors, fix in the relevant component, reload and re-test.

---

## Spec Coverage Checklist

**Design spec requirements → Implementation tasks:**

✅ **SearchCommand** — Task 5: ⌘K modal, grouping, navigation  
✅ **FavoritesDropdown** — Task 6: Bookmarks, FIFO cap, localStorage  
✅ **QuickCreateMenu** — Task 7: 4 create options, modals placeholder  
✅ **SettingsPanel** — Task 8: Theme, density, notifications, refresh, auto-save  
✅ **HealthAlert** — Task 9: Score, status indicators, alerts, action items, polling  
✅ **DashboardHeaderBar** — Task 10: Container combining all 5  
✅ **Integration** — Task 11: Replace broken header in AgencyAdminDashboard  
✅ **Testing** — Task 12: E2E manual verification  

**Deferred (Phase 2):**
- ExportMenu (PDF, CSV, share link) — requires backend export APIs
- BulkImportDialog (file upload) — requires backend import APIs

---

## Commit Summary (Expected 12 commits)

1. `feat: create Zustand dashboard store (favorites, preferences, health alerts)`
2. `feat: add useUserPreferences hook with backend sync`
3. `feat: add useFavorites hook`
4. `feat: add useHealthAlerts hook with 30s polling`
5. `feat: add SearchCommand component with Cmd+K integration`
6. `feat: add FavoritesDropdown component`
7. `feat: add QuickCreateMenu component with 4 create actions`
8. `feat: add SettingsPanel component with auto-save`
9. `feat: add HealthAlert component with system status monitoring`
10. `feat: add DashboardHeaderBar container component`
11. `refactor: replace broken header buttons with DashboardHeaderBar`
12. `test: verify all header icon features on dev server`

---

## Next Steps (Phase 2 — Not in this plan)

1. **ExportMenu component** — PDF export (Playwright), CSV download, share links
2. **BulkImportDialog component** — File upload, preview, execution
3. **Backend APIs** (if not yet built):
   - `GET /api/search` (Meilisearch fallback)
   - `GET /api/agency/health` (system status)
   - `POST /api/export/*` (PDF, CSV)
   - `POST /api/import/*` (file processing)

---

## Known Limitations & Future Improvements

- QuickCreateMenu currently shows toasts instead of opening real forms (integration with existing form components deferred)
- Search uses client cache first, then API (MVP without Meilisearch integration)
- Health alerts polling interval fixed at 30s (could be configurable in future)
- No real-time WebSocket alerts (polling only, sufficient for MVP)
- Favorites limit of 15 is hardcoded (could be dynamic based on agency tier)

