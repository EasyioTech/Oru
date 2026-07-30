# Task 2: Create useUserPreferences Custom Hook

**Files:**
- Create: `frontend/src/modules/core/hooks/useUserPreferences.ts`

**Interfaces:**
- Consumes: `dashboardStore` (from Task 1)
  - `dashboardStore.preferences: UserPreferences`
  - `dashboardStore.updatePreference(key, value): void`
  - Types: `UserPreferences` from dashboardStore
- Produces:
  - `useUserPreferences(): { theme, density, notificationFrequency, dashboardRefreshInterval, updatePreference }`
  - Hook function signature: `() => ReturnType`
  - Return object shape: `{ theme: 'light'|'dark', density: 'compact'|'normal', notificationFrequency: 'daily'|'weekly'|'never', dashboardRefreshInterval: number, updatePreference: (key: keyof UserPreferences, value: any) => void }`

**Complete Implementation:**

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

**Steps:**
- [ ] **Step 1:** Create directory `frontend/src/modules/core/hooks/` if it doesn't exist
- [ ] **Step 2:** Copy code above into `frontend/src/modules/core/hooks/useUserPreferences.ts`
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit` (from frontend dir)
- [ ] **Step 4:** Commit

**Commit message:**
```
feat: add useUserPreferences hook with backend sync
```

**Success criteria:**
- File created at correct path
- Hook imports correctly from dashboardStore (Task 1)
- Hook returns all required properties and methods
- TanStack Query mutation configured
- TypeScript compiles with no errors
- Optimistic update + backend sync pattern implemented
