# Task 6: Create FavoritesDropdown Component

**Files:**
- Create: `frontend/src/modules/core/components/FavoritesDropdown.tsx`

**Interfaces:**
- Consumes: `useFavorites` hook (from Task 3), React Router, Popover (shadcn/ui), lucide-react icons
- Produces: React component `<FavoritesDropdown />` (no props)
  - Renders: Star icon button + popover with list of saved favorites
  - Data driven by `useFavorites().favorites` array
  - Interactions: navigate on favorite select, remove button per item, closes popover after navigate

**Complete Implementation:**

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

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/components/FavoritesDropdown.tsx`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Commit

**Commit message:**
```
feat: add FavoritesDropdown component
```

**Success criteria:**
- File created at correct path
- Component is named FavoritesDropdown and is default export
- Consumes useFavorites hook correctly
- Star icon fills yellow when favorites exist, outline when empty
- Popover displays list of favorites with title and type label
- Remove button (X icon) per favorite removes item and closes popover
- Navigation on favorite select closes popover and navigates
- Empty state message: "No favorites yet" with hint
- Scrollable list with max-height-80 constraint
- TypeScript compiles with no errors
