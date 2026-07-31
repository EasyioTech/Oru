# Task 10: Create DashboardHeaderBar Container Component

**Files:**
- Create: `frontend/src/modules/core/components/DashboardHeaderBar.tsx`

**Interfaces:**
- Consumes: SearchCommand, FavoritesDropdown, QuickCreateMenu, SettingsPanel, HealthAlert components
- Produces: React component `<DashboardHeaderBar />` (no props)
  - Renders: Horizontal bar with all 5 MVP header icon components arranged left-to-right

**Complete Implementation:**

```typescript
import { SearchCommand } from './SearchCommand';
import { FavoritesDropdown } from './FavoritesDropdown';
import { QuickCreateMenu } from './QuickCreateMenu';
import { SettingsPanel } from './SettingsPanel';
import { HealthAlert } from './HealthAlert';

export function DashboardHeaderBar() {
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200">
      {/* Left: Search */}
      <div className="flex-1">
        <SearchCommand />
      </div>

      {/* Right: Action buttons in row */}
      <div className="flex items-center gap-1">
        <FavoritesDropdown />
        <QuickCreateMenu />
        <HealthAlert />
        <SettingsPanel />
      </div>
    </div>
  );
}
```

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/components/DashboardHeaderBar.tsx`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Add export to barrel (`frontend/src/modules/core/components/index.ts`)
- [ ] **Step 5:** Verify TypeScript again
- [ ] **Step 6:** Commit both files

**Commit messages:**
```
feat: add DashboardHeaderBar container with all MVP components
feat: export DashboardHeaderBar from components barrel
```

**Success criteria:**
- File created at correct path
- Component is named DashboardHeaderBar and is default export
- Horizontal layout with white background and bottom border
- SearchCommand positioned on left (flex-1 to take remaining space)
- 4 action buttons (Favorites, QuickCreate, HealthAlert, Settings) positioned on right
- Buttons arranged horizontally with 4px gap (gap-1)
- Proper padding and alignment
- All 5 components render and interact independently
- Exported in barrel index
- TypeScript compiles with no errors
