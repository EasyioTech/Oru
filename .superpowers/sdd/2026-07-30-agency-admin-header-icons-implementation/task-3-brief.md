# Task 3: Create useFavorites Custom Hook

**Files:**
- Create: `frontend/src/modules/core/hooks/useFavorites.ts`

**Interfaces:**
- Consumes: `dashboardStore` (from Task 1)
  - `dashboardStore.favorites: Favorite[]`
  - `dashboardStore.addFavorite(favorite: Favorite): void`
  - `dashboardStore.removeFavorite(id: string): void`
  - Types: `Favorite` from dashboardStore
- Produces:
  - `useFavorites(): { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorited }`
  - Return type: `{ favorites: Favorite[], addFavorite, removeFavorite, toggleFavorite, isFavorited }`

**Complete Implementation:**

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

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/hooks/useFavorites.ts`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Commit

**Commit message:**
```
feat: add useFavorites hook
```

**Success criteria:**
- File created at correct path
- Hook imports correctly from dashboardStore (Task 1)
- Hook returns all 5 required methods/properties
- toggleFavorite uses useCallback with correct dependencies
- isFavorited checks favorites array
- TypeScript compiles with no errors
