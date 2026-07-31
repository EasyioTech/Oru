# Task 12: End-to-End Testing on Dev Server

**No files to create. Manual testing task.**

**Purpose:** Verify all 5 MVP header icon features work flawlessly in browser with proper UX, state management, and no console errors.

**Test Environment:**
- Dev server: `npm run dev` from project root
- Navigation: http://localhost:5173/dashboards/agency-admin (or configured dev URL)
- Browser DevTools: Open console (F12) to watch for errors, warnings

**Test Cases:**

### 1. SearchCommand (Cmd+K / Ctrl+K)
- [ ] **Press Cmd+K** (macOS) or **Ctrl+K** (Windows/Linux) from anywhere on page
- [ ] Command palette opens showing "Search" input with placeholder
- [ ] Type a query (e.g., "project", "invoice") → results group by type (Users, Projects, Invoices, etc.)
- [ ] Click a result → closes palette and navigates to that resource
- [ ] Press **Escape** → palette closes without navigation
- [ ] Press **Escape** again on closed palette → nothing breaks
- [ ] Console: no errors or warnings logged

### 2. FavoritesDropdown (Star Icon)
- [ ] **Click star icon** → popover opens showing "Favorites" section
- [ ] If no favorites exist → "No favorites yet" message shown
- [ ] **Add a favorite** (e.g., from search result or via useFavorites hook):
  - Popover closes after adding
  - Click star again → list shows the new favorite with title, type, remove (X) button
- [ ] **Remove a favorite** → click X on item → item removed from list immediately
- [ ] **Click favorite item** → navigates to that resource and closes popover
- [ ] Star icon **fills yellow** when favorites exist, **outline gray** when empty
- [ ] Scrollable if many favorites (max-h-80)
- [ ] Console: no errors or warnings logged

### 3. QuickCreateMenu (Plus Icon)
- [ ] **Click plus icon** → popover opens with 4 actions:
  - Create Project (Briefcase icon)
  - Invite User (Users icon)
  - Create Invoice (FileText icon)
  - Create Task (CheckSquare icon)
- [ ] Each action shows **icon + label + description**
- [ ] **Click an action** → toast notification shows (placeholder for actual form)
- [ ] Popover closes after action click
- [ ] Hover over action → background color changes (hover state)
- [ ] Console: no errors or warnings logged

### 4. HealthAlert (Status Icon)
- [ ] **Click status icon** → popover opens with "Agency Health Status" header
- [ ] If no alerts → "Everything is running smoothly" message shown
- [ ] If alerts exist → shows **alert count badge** on icon (top-right corner)
- [ ] Each alert shows:
  - **Icon** (colored by type: red=critical, yellow=warning, blue=info, green=ok)
  - **Title** (alert name)
  - **Message** (description)
  - **Date** (formatted date)
- [ ] Status color on icon reflects highest severity (red > yellow > green)
- [ ] Alert list is **scrollable** if many alerts (max-h-96)
- [ ] No interaction on alerts (read-only display)
- [ ] Console: no errors or warnings logged

### 5. SettingsPanel (Gear Icon)
- [ ] **Click gear icon** → slide-out sheet opens from right with "Dashboard Settings" title
- [ ] **Appearance section:**
  - Theme select (Light/Dark) — change value and verify preference updates
  - Density select (Compact/Normal) — change value and verify preference updates
- [ ] **Notifications section:**
  - Alert Frequency select (Daily/Weekly/Never) — change value and verify preference updates
- [ ] **Dashboard section:**
  - Refresh Interval select (10/30/60/300 seconds) — change value and verify preference updates
- [ ] Each setting **persists on page reload** (localStorage via Zustand)
- [ ] Bottom message shows "Changes are saved automatically"
- [ ] Close sheet (click X or click outside) — settings saved
- [ ] Reopen sheet → values match what was set
- [ ] Console: no errors or warnings logged

### 6. Overall Integration (DashboardHeaderBar)
- [ ] **Layout:** All 5 components render in header bar without overlap
- [ ] **Spacing:** Proper gaps between buttons (gap-1 = 4px)
- [ ] **Styling:** White background, bottom border, proper padding
- [ ] **Search on left** takes remaining space; **4 buttons on right** stay compact
- [ ] **No console errors** after any interaction with any component
- [ ] **No console warnings** related to React hooks, missing deps, etc.
- [ ] **No visual layout shift** when popovers/sheets open
- [ ] **Responsive** (test on mobile/tablet width if available)

### 7. State Persistence (Advanced)
- [ ] Set favorites, then refresh page → favorites still exist ✓
- [ ] Change settings, then refresh page → settings still applied ✓
- [ ] Health alerts update in real-time without manual refresh ✓

**Test Report:**
After running all test cases, create a test summary:

**Format:**
```
✓ SearchCommand: [PASS/FAIL] — [summary]
✓ FavoritesDropdown: [PASS/FAIL] — [summary]
✓ QuickCreateMenu: [PASS/FAIL] — [summary]
✓ HealthAlert: [PASS/FAIL] — [summary]
✓ SettingsPanel: [PASS/FAIL] — [summary]
✓ DashboardHeaderBar: [PASS/FAIL] — [summary]

Console errors: [COUNT or NONE]
Console warnings: [COUNT or NONE]

Overall: [PASS / FAIL with notes]
```

**Success criteria:**
- All 5 components render and are interactive
- No console errors or warnings
- State persists across page reloads (favorites, settings)
- All keyboard shortcuts work (Cmd+K / Ctrl+K)
- All popovers/sheets open and close smoothly
- All forms and selects work without errors
- No layout shifts or styling issues
