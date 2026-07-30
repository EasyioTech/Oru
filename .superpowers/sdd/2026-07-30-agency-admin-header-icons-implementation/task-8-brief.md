# Task 8: Create SettingsPanel Component

**Files:**
- Create: `frontend/src/modules/core/components/SettingsPanel.tsx`

**Interfaces:**
- Consumes: `useUserPreferences` hook (from Task 2), Sheet (shadcn/ui), Select (shadcn/ui), lucide-react icons
- Produces: React component `<SettingsPanel />` (no props)
  - Renders: Settings gear icon button + slide-out sheet with settings controls
  - Settings: Theme (light/dark), Density (compact/normal), Notification Frequency (daily/weekly/never), Dashboard Refresh Interval (10/30/60/300 seconds)

**Complete Implementation:**

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

**Steps:**
- [ ] **Step 1:** Create the file at `frontend/src/modules/core/components/SettingsPanel.tsx`
- [ ] **Step 2:** Copy the complete implementation code above (verbatim)
- [ ] **Step 3:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 4:** Add export to barrel (`frontend/src/modules/core/components/index.ts`)
- [ ] **Step 5:** Verify TypeScript again
- [ ] **Step 6:** Commit both files

**Commit messages:**
```
feat: add SettingsPanel component with auto-save
feat: export SettingsPanel from components barrel
```

**Success criteria:**
- File created at correct path
- Component is named SettingsPanel and is default export
- Settings gear icon button with slide-out sheet
- Sheet title: "Dashboard Settings", description: "Customize your dashboard experience"
- Appearance section: Theme select (light/dark) and Density select (compact/normal)
- Notifications section: Alert Frequency select (daily/weekly/never)
- Dashboard section: Refresh Interval select (10/30/60/300 seconds)
- Auto-save message at bottom: "Changes are saved automatically"
- All settings connected to useUserPreferences hook
- Exported in barrel index
- TypeScript compiles with no errors
