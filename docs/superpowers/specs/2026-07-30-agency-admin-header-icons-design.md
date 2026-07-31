# Agency Admin Dashboard Header Icons — Design Spec

**Date:** 2026-07-30  
**Scope:** Dashboard header icons functionality for agency administrators  
**Status:** Design phase (awaiting review)

---

## Overview

Transform 7 currently-unused/broken header icons into a cohesive, functional command center for agency admins. These icons provide rapid access to search, create, customize, export, and monitor agency operations without leaving the dashboard.

---

## Architecture

### Component Structure
```
AgencyAdminDashboard (existing)
├── DashboardHeaderBar (NEW - replace lines 54-66)
│   ├── SearchCommand (⌘K global search, cmdk component)
│   ├── FavoritesDropdown (star icon, saved views)
│   ├── QuickCreateMenu (plus icon, dropdown with 4 actions)
│   ├── ExportMenu (share icon, CSV/PDF downloads)
│   ├── BulkImportDialog (upload icon, file upload)
│   ├── SettingsPanel (settings icon, modal/sheet)
│   └── HealthAlert (monitor icon, real-time status)
└── [existing dashboard content]
```

### Data Flow
- **Search**: Local TanStack Query (agency data cache) + Meilisearch for full-text
- **Favorites**: Zustand store (`dashboardStore`) — persisted to localStorage
- **Quick Create**: Form dialogs → API calls → cache invalidation
- **Export**: BullMQ job → generates async → download or email
- **Upload**: Form submit → MultipartFormData → backend batch processor
- **Settings**: Zustand store + API patch → useAuth re-sync
- **Monitor**: WebSocket listener or polling (useQuery with refetch interval)

---

## Feature Specifications

### 1. **Search Command (⌘K Global Omnisearch)**

**Icon:** `Search` (magnifying glass)  
**Trigger:** Click icon OR `Cmd+K` / `Ctrl+K`  
**Component:** `<SearchCommand />` (uses `cmdk` package)

**Scope:** Search across all agency data
- Users (by name, email, role)
- Projects (by name, status, owner)
- Invoices (by number, client, amount range)
- Tasks (by title, assignee, due date)
- Documents (by filename, tags)

**UX:**
1. Click search icon → modal opens with input field
2. Type query → real-time filtering from local cache (instant)
3. If cache misses → fire Meilisearch request (500ms debounce)
4. Show results grouped by type (Users → Projects → Invoices → etc.)
5. Click result → navigate to detail page OR show preview card
6. Press Escape → close modal

**API Integration:**
- **Read cache first:** `useQuery(['agencyData'])` (persisted from dashboard loads)
- **Fallback:** `POST /api/search` → Meilisearch (if local miss)
- **Response schema:** `{ type: 'user'|'project'|'invoice'|'task'|'document', id, title, meta }`

**Component Checklist:**
- [ ] Keyboard shortcut listener
- [ ] Debounced search handler
- [ ] Result grouping & rendering
- [ ] Navigation on selection
- [ ] Loading state (skeleton)
- [ ] Empty state ("No results")

---

### 2. **Favorites / Bookmarks (⭐ Star)**

**Icon:** `Star` (outline when empty, filled when favorited)  
**Trigger:** Click icon → dropdown menu  
**Component:** `<FavoritesDropdown />`

**Concept:** Admins bookmark frequently-used reports, views, or team members for one-click access.

**Bookmark Types:**
1. **Report Views** — saved filter+metric combinations (e.g., "Active Projects Q3")
2. **Team Members** — frequently contacted (quick email/message)
3. **Client Dashboards** — per-client summary pages

**UX:**
1. Hover over favoritable item (report card, project, person) → see heart/star icon
2. Click star → toast: "Added to favorites"
3. Click header star icon → dropdown shows 5-8 recent favorites
4. Click favorite in dropdown → navigate to that view
5. Long-press/hover in dropdown → option to remove

**State Management:**
- **Zustand store:** `dashboardStore.favorites: Favorite[]`
- **Persist to:** localStorage (auto-sync via Zustand middleware)
- **Schema:** `{ id: string, type: 'report'|'team'|'client', title, url, icon, timestamp }`
- **Max 15 favorites** (FIFO cleanup if exceeded)

**API:** No backend call needed (client-side only, localStorage)

**Component Checklist:**
- [ ] Zustand favorites store + localStorage middleware
- [ ] Star icon button with filled/outline toggle
- [ ] Dropdown menu (vaul sheet or shadcn popover)
- [ ] Add-to-favorites handlers on dashboard cards
- [ ] Favorites list with remove action
- [ ] Empty state message

---

### 3. **Quick Create Menu (➕ Plus)**

**Icon:** `Plus`  
**Trigger:** Click icon → dropdown menu with 4 options  
**Component:** `<QuickCreateMenu />`

**Create Options (Most-used agency actions):**
1. **Create Project** → Modal form → POST `/api/projects`
2. **Invite User** → Modal form → POST `/api/users/invite`
3. **Create Invoice** → Modal form → POST `/api/finance/invoices`
4. **Create Task** → Modal form → POST `/api/projects/tasks`

**UX:**
1. Click plus icon → dropdown shows 4 options with icons
2. Click option → form modal opens (fullscreen on mobile)
3. Fill form → submit → toast: "Project created" → navigate to new item OR refresh dashboard
4. Cancel → close modal, stay on dashboard

**Forms (all use React Hook Form + Zod):**
- **Project:** name, description, startDate, endDate, lead, budget, visibility
- **User:** email, name, role (Employee|Manager|Admin), department, send-invite-email checkbox
- **Invoice:** clientId, lineItems (repeatable), dueDate, notes, send-email checkbox
- **Task:** projectId, title, description, assignee, dueDate, priority

**API Integration:**
- Each form posts to module endpoint (e.g., `POST /api/projects`)
- On success: invalidate `['agencyData']` cache + toast confirmation
- On error: show inline validation errors

**Component Checklist:**
- [ ] Dropdown menu with 4 options
- [ ] 4 form modals (ProjectForm, UserInviteForm, InvoiceForm, TaskForm)
- [ ] Form validation (Zod + React Hook Form)
- [ ] Loading states during submit
- [ ] Success/error toasts
- [ ] Cache invalidation post-submit

---

### 4. **Export / Share (📤 Share)**

**Icon:** `Share2`  
**Trigger:** Click icon → dropdown menu with 2-3 options  
**Component:** `<ExportMenu />`

**Export Options:**
1. **Download Dashboard as PDF** → Playwright render → download (async BullMQ job)
2. **Export Metrics CSV** → Immediate CSV download (agency metrics + activity)
3. **Share Dashboard Link** → Copy shareable read-only link to clipboard

**UX:**
1. Click share icon → dropdown with 3 options
2. **PDF export:** Click → "Generating PDF..." (loading state) → download appears after 2-5s
3. **CSV export:** Click → immediate download (no wait)
4. **Share link:** Click → copy to clipboard → toast "Link copied"
5. Shared links have token + expiry (7 days)

**API Integration:**
- **PDF:** `POST /api/export/pdf-dashboard` → queue BullMQ job → return job ID → poll for completion → `/api/export/jobs/{jobId}/download`
- **CSV:** `GET /api/export/csv-metrics?agencyId=X` → streaming response
- **Share link:** `POST /api/share/create-link` → returns `{url, token, expiresAt}`

**Component Checklist:**
- [ ] Export dropdown menu
- [ ] PDF export with loading state + toast on completion
- [ ] CSV export with instant download
- [ ] Share link generator + clipboard copy
- [ ] Link expiry management (backend BullMQ cleanup job)
- [ ] Read-only dashboard view for shared links

---

### 5. **Bulk Import (📁 Upload)**

**Icon:** `Upload`  
**Trigger:** Click icon → file upload dialog  
**Component:** `<BulkImportDialog />`

**Import Types:**
1. **Employees CSV** — bulk create users from CSV (name, email, role, department)
2. **Project Template** — JSON/YAML configuration (tasks, milestones, team)
3. **Vendor/Supplier List** — CSV with contact info, payment terms

**UX:**
1. Click upload icon → dialog "What do you want to import?"
2. Select type → file picker (CSV or JSON/YAML)
3. Drag-drop or click to select file
4. Preview import results (rows, validation errors, conflicts)
5. Click "Import" → BullMQ job queued → toast: "Importing 45 rows..." → refresh dashboard when done
6. Show import summary (created: 45, failed: 2, skipped: 1)

**API Integration:**
- `POST /api/import/preview` → validate file, show preview (no changes yet)
- `POST /api/import/execute` → queue BullMQ job + return job ID
- `GET /api/import/jobs/{jobId}/status` → poll for progress
- Response: `{ created, failed, skipped, errors: [{row, reason}] }`

**Component Checklist:**
- [ ] Import type selector
- [ ] File upload with drag-drop
- [ ] Preview modal (show rows, validation errors)
- [ ] Execute import with loading state
- [ ] Import summary display
- [ ] Error details & retry option
- [ ] CSV template download link

---

### 6. **Settings Panel (⚙️ Settings)**

**Icon:** `Settings` (gear)  
**Trigger:** Click icon → slide-out panel or modal  
**Component:** `<SettingsPanel />`

**Settings Sections:**
1. **Appearance:** Theme (light/dark), density (compact/normal), sidebar collapse
2. **Dashboard:** Default filters, refresh interval, visible metrics
3. **Notifications:** Email alerts (daily/weekly/never), in-app toast timing
4. **Permissions:** View role-based settings (read-only for non-admins)
5. **Account:** Change password, two-factor auth (if applicable)

**UX:**
1. Click settings icon → sheet/modal opens from right side
2. Tabs or sections for each setting group
3. Change setting → auto-save with toast
4. Settings persist to backend (`PATCH /api/users/me`)
5. On change, update Zustand store + useAuth hook

**State Management:**
- **Zustand:** `userPreferencesStore` — theme, density, notificationFrequency, etc.
- **Backend:** `users.preferences` JSON column (Drizzle)
- **Sync:** On mount, load from backend; on change, debounce 500ms then PATCH

**API Integration:**
- `GET /api/users/me` — includes `preferences: {...}`
- `PATCH /api/users/me` — update `preferences` field
- Invalidate `['userProfile']` cache post-update

**Component Checklist:**
- [ ] Settings sheet/modal with tabs
- [ ] Theme toggle (light/dark)
- [ ] Appearance density selector
- [ ] Dashboard filter defaults
- [ ] Notification frequency dropdown
- [ ] Preferences Zustand store
- [ ] Debounced PATCH to backend
- [ ] Success/error toasts

---

### 7. **Health & Alerts (🔍 Monitor)**

**Icon:** `Monitor`  
**Trigger:** Click icon → popover with status + recent alerts  
**Component:** `<HealthAlert />`

**Displayed Metrics:**
- **Agency Health Score:** Current (already on dashboard)
- **System Status:** API health, database, Redis (green/yellow/red)
- **Recent Alerts:** Last 5 alerts (e.g., "High invoice backlog", "Storage 85% full")
- **Action Items:** Top 3 overdue tasks/approvals for this agency

**UX:**
1. Click monitor icon → popover (small, ~350px wide)
2. Show circular health score at top (92/100)
3. Status indicators below (3 rows: API, DB, Redis with dots)
4. Recent alerts list (scrollable if >5)
5. Click alert → navigate to relevant page (e.g., invoices if billing alert)
6. "View Full Report" button → navigate to `/dashboards/agency-admin/health`

**API Integration:**
- `GET /api/agency/health` → `{ score, status: {api, db, redis}, alerts: [...], actionItems: [...] }`
- Polling: `useQuery(['agencyHealth'], {...}, { refetchInterval: 30000 })` (30s)
- WebSocket (optional enhancement): Subscribe to alerts in real-time

**Component Checklist:**
- [ ] Health score display (circular)
- [ ] Status indicators (API, DB, Redis)
- [ ] Recent alerts list
- [ ] Action items summary
- [ ] Click-to-navigate from alerts
- [ ] Loading & error states
- [ ] Polling interval (30s)

---

## Implementation Order (Dependency Chain)

1. **DashboardHeaderBar** — Main container, replace lines 54-66
2. **SearchCommand** — Independent, lowest dependency
3. **FavoritesDropdown** — Independent, Zustand store
4. **HealthAlert** — Depends on `GET /api/agency/health` API (may need backend work)
5. **QuickCreateMenu** — Depends on existing form components (ProjectForm, etc.)
6. **SettingsPanel** — Depends on `useAuth` hook, Zustand
7. **ExportMenu** — Depends on backend export APIs (may need BullMQ setup)
8. **BulkImportDialog** — Depends on backend import APIs (may need BullMQ setup)

---

## File Structure (Frontend)

```
frontend/src/modules/core/
├── components/
│   ├── DashboardHeaderBar.tsx       [NEW - main container]
│   ├── SearchCommand.tsx             [NEW - omni-search with cmdk]
│   ├── FavoritesDropdown.tsx         [NEW - bookmarks]
│   ├── QuickCreateMenu.tsx           [NEW - create 4 types]
│   ├── ExportMenu.tsx                [NEW - PDF, CSV, share link]
│   ├── BulkImportDialog.tsx          [NEW - upload file import]
│   ├── SettingsPanel.tsx             [NEW - preferences]
│   └── HealthAlert.tsx               [NEW - status popover]
├── hooks/
│   ├── useFavorites.ts               [NEW - Zustand store hook]
│   ├── useHealthAlerts.ts            [NEW - fetch agency health]
│   └── useUserPreferences.ts         [NEW - settings Zustand]
└── stores/
    ├── dashboardStore.ts             [NEW - favorites + settings]
```

---

## Backend Requirements (Summary)

All features except Favorites & Settings Panel can be implemented client-side initially.

**Minimum backend work needed:**
1. **Search API:** `POST /api/search` (optional, use local cache for MVP)
2. **Health API:** `GET /api/agency/health` (required for Monitor icon)
3. **Export APIs:** `POST /api/export/pdf-dashboard`, `GET /api/export/csv-metrics` (optional for MVP)
4. **Import APIs:** `POST /api/import/preview`, `POST /api/import/execute` (optional for MVP)
5. **Settings update:** `PATCH /api/users/me` (already exists, just use preferences column)

**MVP (Minimum Viable Product):**
- ✅ Search Command
- ✅ Favorites
- ✅ Quick Create (leveraging existing forms)
- ✅ Settings Panel
- ⏳ Health Alert (if GET `/api/agency/health` available)
- ⏸️ Export (deferred to Phase 2)
- ⏸️ Bulk Import (deferred to Phase 2)

---

## Testing Strategy

### Unit Tests
- Zustand store actions (favorites, preferences)
- Search filtering logic
- Form validation (Zod schemas)

### Integration Tests
- Quick Create → API call → cache invalidation
- Settings change → PATCH → useAuth re-sync
- Search → cache hit vs. API fallback

### Manual Testing (E2E)
1. ⌘K search → type "project" → see results → click → navigate
2. Star icon → favorite a report → reload page → favorite persists
3. Plus icon → create new project → form submits → dashboard refreshes
4. Settings → toggle theme → page updates immediately
5. Monitor icon → see health score + alerts → click alert → navigate

---

## Success Criteria

✅ **Usability:**
- Any icon clickable & responsive within 200ms
- No broken states or console errors
- Mobile-friendly (touch-friendly icon targets ≥44px)

✅ **Functionality:**
- All 7 icons have working features (no placeholders)
- Search returns results within 500ms (local) or 2s (API)
- Favorites persist across sessions
- Settings auto-save with visual feedback

✅ **Performance:**
- Header loads in <100ms
- Dropdown menus appear in <50ms
- Favorite star toggle is instant (optimistic update)

✅ **Code Quality:**
- All components <200 lines
- TypeScript strict mode, no `any` types
- Proper error handling & loading states
- Zustand stores with clear contracts

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Search slow on large datasets | Use local cache first, Meilisearch for fallback, debounce |
| Export job fails silently | Poll for status, show error toast, allow retry |
| Settings don't persist on refresh | Fetch from backend on auth hook mount |
| Favorites localStorage quota exceeded | Cap at 15 items, FIFO cleanup |
| Mobile icon targets too small | Test at 44px minimum, add padding |

---

## Open Questions / Deferred Decisions

1. **Search:** Should we include activity logs or only main entities? → Decision: Main entities only (MVP)
2. **Favorites max count:** 15 or unlimited? → Decision: 15 (storage & UX)
3. **Export format:** PDF of dashboard OR report builder? → Decision: PDF of current view (MVP)
4. **Bulk import conflict handling:** Skip duplicates or update existing? → Decision: Show preview, let user choose (Phase 2)
5. **Health alerts:** Push notifications or in-app only? → Decision: In-app popover only (MVP)

---

## Commit Strategy

Each feature gets its own focused commit:
1. `feat: add SearchCommand component with cmdk integration`
2. `feat: add FavoritesDropdown with Zustand store`
3. `feat: add QuickCreateMenu with form dialogs`
4. `feat: add SettingsPanel with preferences sync`
5. `feat: add HealthAlert popover with API polling`
6. `feat: add ExportMenu (PDF, CSV, share link) — Phase 2`
7. `feat: add BulkImportDialog — Phase 2`
8. `refactor: replace old header button placeholders with DashboardHeaderBar`

---

## Done Checklist

- [ ] Spec reviewed and approved by user
- [ ] Backend APIs stubbed/implemented (if needed)
- [ ] Components built and tested
- [ ] Integrated into AgencyAdminDashboard
- [ ] E2E testing on dev server
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Performance audit (Lighthouse)
- [ ] Commits pushed & merged to main
