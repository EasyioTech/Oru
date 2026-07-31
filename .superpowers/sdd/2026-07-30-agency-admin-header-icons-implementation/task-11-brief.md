# Task 11: Integrate DashboardHeaderBar into AgencyAdminDashboard

**Files:**
- Modify: `frontend/src/pages/dashboards/agency-admin/index.tsx` (lines ~54-66)

**Interfaces:**
- Consumes: DashboardHeaderBar component (from Task 10)
- Modifies: AgencyAdminDashboard page layout to use new header bar

**Current Code to Replace:**

Current lines 54-66 contain placeholder button stubs:
```typescript
        <div className="flex gap-2 px-6 py-3 bg-white border-b border-gray-200">
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300">
            <Mail className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300">
            <Monitor className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300">
            <Pen className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
```

**Replacement Code:**

```typescript
        <DashboardHeaderBar />
```

**Complete Updated Import Section:**

Add this import to the imports at the top of the file:
```typescript
import { DashboardHeaderBar } from '../../../modules/core/components';
```

**Steps:**
- [ ] **Step 1:** Open `frontend/src/pages/dashboards/agency-admin/index.tsx`
- [ ] **Step 2:** Add import: `import { DashboardHeaderBar } from '../../../modules/core/components';`
- [ ] **Step 3:** Replace lines 54-66 (the placeholder button div) with single line: `<DashboardHeaderBar />`
- [ ] **Step 4:** Remove unused icon imports (Mail, Monitor, Pen, MoreHorizontal) if no longer used elsewhere
- [ ] **Step 5:** Verify TypeScript compilation: `npm run tsc --noEmit`
- [ ] **Step 6:** Commit

**Commit message:**
```
feat: integrate DashboardHeaderBar into agency-admin dashboard
```

**Success criteria:**
- Import added correctly to top of file
- Placeholder div and buttons replaced with single `<DashboardHeaderBar />` component
- Component renders in the header area with proper styling
- All icon imports still used (if not, remove them)
- No TypeScript errors
- No layout shift or styling changes (should look identical to placeholder)
