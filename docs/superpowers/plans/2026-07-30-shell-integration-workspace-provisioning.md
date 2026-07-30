# Shell Integration + Workspace Auto-Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the adaptive workspace onboarding system into the app shell and automatically provision workspaces on agency creation, enabling end-to-end onboarding UX.

**Architecture:** 
1. **Backend:** Extend WorkspaceProfileService with factory method for default workspace creation + starter modules config. Wire into AgencyProvisioningService to auto-create workspaces during signup. Audit and clean services for debt.
2. **Frontend:** Integrate AdaptiveNavigation hook into app shell sidebar. Replace static dashboard route with AdaptiveDashboard. Add workspace context provider for reactive UI updates.
3. **Data Flow:** Agency created → workspace auto-provisioned with starter modules → dashboard renders adaptive UI based on workspace maturity/capabilities.

**Tech Stack:** Fastify, Drizzle ORM, React 18, React Router 7, TanStack Query, Zustand.

## Global Constraints

- File size limits: service max 300 lines, routes max 150 lines, components max 200 lines
- All database writes must return typed objects, never raw rows
- All API calls in React go through TanStack Query hooks
- Naming: `snake_case` for DB tables, `PascalCase` for types, `camelCase` for functions
- Zero `any` type annotations — use proper TypeScript
- Commit after each task completion

---

## File Structure

**Files to create:**
- `backend/src/modules/core/config/starter-modules.ts` — module provisioning defaults
- `backend/src/modules/core/types/workspace.ts` — workspace types (extracted from service)

**Files to modify:**
- `backend/src/modules/core/services/workspace-profile.service.ts` — add factory method
- `backend/src/modules/agencies/services/provisioning.service.ts` — integrate workspace init
- `frontend/src/App.tsx` — wire providers and adaptive components
- `frontend/src/routes.tsx` — update dashboard route
- `frontend/src/shared/layout/Shell.tsx` — integrate AdaptiveNavigation

---

## Task 1: Audit and Extract WorkspaceProfileService Types

**Files:**
- Read: `backend/src/modules/core/services/workspace-profile.service.ts`
- Create: `backend/src/modules/core/types/workspace.ts`
- Modify: `backend/src/modules/core/services/workspace-profile.service.ts` (update imports)

**Interfaces:**
- Produces: TypeScript types for workspace profile operations (WorkspaceProfile, WorkspaceProfileData, ModuleStatus)

**Steps:**

- [ ] **Step 1:** Read workspace-profile.service.ts and identify all types used in interfaces

Current file contains inline interfaces. Extract to separate type file for clarity and reuse.

- [ ] **Step 2:** Create `backend/src/modules/core/types/workspace.ts`

```typescript
import type { WorkspaceProfile as DBWorkspaceProfile } from '../../../infrastructure/database/schema.js';

export interface ModuleStatus {
  name: string;
  enabled: boolean;
  createdAt: Date;
}

export interface WorkspaceModules {
  active: ModuleStatus[];
  available: ModuleStatus[];
  disabled: ModuleStatus[];
}

export interface CollaborationMetrics {
  membersCount: number;
  solo: boolean;
  emailVerified: boolean;
}

export interface AdoptionMetrics {
  featuresUsed: string[];
  daysActive: number;
  lastAction: string;
}

export interface HealthMetrics {
  score: number;
  lastUpdated: string;
}

export type QuickWin = {
  id: string;
  title: string;
  description: string;
  action: string;
  completed: boolean;
};

export type Recommendation = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
};

export interface WorkspaceProfile extends Omit<DBWorkspaceProfile, 'modules_json' | 'collaboration_json' | 'adoption_json' | 'health_json' | 'recommendations_json' | 'quick_wins_json'> {
  modules_json: WorkspaceModules;
  collaboration_json: CollaborationMetrics;
  adoption_json: AdoptionMetrics;
  health_json: HealthMetrics;
  recommendations_json: Recommendation[];
  quick_wins_json: QuickWin[];
}

export interface WorkspaceProfileData {
  modules_json?: WorkspaceModules;
  collaboration_json?: CollaborationMetrics;
  adoption_json?: AdoptionMetrics;
  health_json?: HealthMetrics;
  recommendations_json?: Recommendation[];
  quick_wins_json?: QuickWin[];
  updated_at?: Date;
}
```

- [ ] **Step 3:** Update workspace-profile.service.ts to import types from workspace.ts

Replace inline types with:
```typescript
import type { WorkspaceProfile, WorkspaceProfileData } from '../types/workspace.js';
```

- [ ] **Step 4:** Run TypeScript check

```bash
cd backend && npm run tsc
```

Expected: No errors. Workspace types properly extracted.

- [ ] **Step 5:** Commit

```bash
git add backend/src/modules/core/types/workspace.ts backend/src/modules/core/services/workspace-profile.service.ts
git commit -m "refactor: extract workspace types to separate module for reuse"
```

---

## Task 2: Create Starter Modules Configuration

**Files:**
- Create: `backend/src/modules/core/config/starter-modules.ts`

**Interfaces:**
- Produces: `StarterModuleConfig[]` array with enabled core modules for new workspaces

**Steps:**

- [ ] **Step 1:** Create `backend/src/modules/core/config/starter-modules.ts`

```typescript
/**
 * Default modules enabled for new workspaces
 * These are the baseline modules every agency needs to get started
 */

export interface StarterModuleConfig {
  name: string;
  enabled: boolean;
  description: string;
}

export const STARTER_MODULES: StarterModuleConfig[] = [
  {
    name: 'core',
    enabled: true,
    description: 'Authentication, users, settings',
  },
  {
    name: 'dashboard',
    enabled: true,
    description: 'Workspace overview and analytics',
  },
  {
    name: 'crm',
    enabled: true,
    description: 'Clients, leads, deals management',
  },
  {
    name: 'hr',
    enabled: false,
    description: 'Employees, attendance, leave',
  },
  {
    name: 'finance',
    enabled: false,
    description: 'Invoices, payments, ledger',
  },
  {
    name: 'inventory',
    enabled: false,
    description: 'Products, stock, warehouses',
  },
  {
    name: 'projects',
    enabled: false,
    description: 'Tasks, milestones, time tracking',
  },
  {
    name: 'procurement',
    enabled: false,
    description: 'Purchase orders, suppliers',
  },
  {
    name: 'reports',
    enabled: false,
    description: 'Report builder, exports',
  },
];

export function getStarterModules(): StarterModuleConfig[] {
  return STARTER_MODULES;
}
```

- [ ] **Step 2:** Test import and verify array structure

```bash
cd backend && node -e "import('./dist/modules/core/config/starter-modules.js').then(m => console.log(m.STARTER_MODULES.length, 'modules'))"
```

Expected: "9 modules"

- [ ] **Step 3:** Commit

```bash
git add backend/src/modules/core/config/starter-modules.ts
git commit -m "feat: create starter modules configuration for workspace provisioning"
```

---

## Task 3: Add Factory Method to WorkspaceProfileService

**Files:**
- Modify: `backend/src/modules/core/services/workspace-profile.service.ts`
- Read: `backend/src/modules/core/config/starter-modules.ts`

**Interfaces:**
- Consumes: `StarterModuleConfig[]` from Task 2
- Produces: `createDefaultWorkspace(workspaceId, agencyId): Promise<WorkspaceProfile>` method

**Steps:**

- [ ] **Step 1:** Add import at top of workspace-profile.service.ts

```typescript
import { STARTER_MODULES } from '../config/starter-modules.js';
```

- [ ] **Step 2:** Add factory method before closing brace of WorkspaceProfileService class

```typescript
async createDefaultWorkspace(
  workspaceId: string,
  agencyId: string
): Promise<WorkspaceProfile> {
  try {
    const starterModules = STARTER_MODULES.map((module) => ({
      name: module.name,
      enabled: module.enabled,
      createdAt: new Date(),
    }));

    const profile = await this.initializeProfile(workspaceId, agencyId);

    // Update with starter modules configuration
    const updated = await this.updateProfile(workspaceId, {
      modules_json: {
        active: starterModules.filter((m) => m.enabled),
        available: STARTER_MODULES,
        disabled: starterModules.filter((m) => !m.enabled),
      },
      adoption_json: {
        featuresUsed: [],
        daysActive: 0,
        lastAction: new Date().toISOString(),
      },
    });

    // Log workspace creation activity
    await this.db
      .insert(workspaceActivity)
      .values({
        workspace_id: workspaceId,
        event_type: 'workspace_created',
        actor_type: 'system',
        details: {
          agencyId,
          starterModulesEnabled: starterModules
            .filter((m) => m.enabled)
            .map((m) => m.name),
        },
      });

    this.log.info(
      { workspaceId, agencyId, modulesEnabled: starterModules.filter((m) => m.enabled).length },
      'Default workspace created with starter modules'
    );

    return updated;
  } catch (error) {
    this.log.error(
      { error, workspaceId, agencyId },
      'Failed to create default workspace'
    );
    throw error;
  }
}
```

- [ ] **Step 3:** Run TypeScript check

```bash
cd backend && npm run tsc
```

Expected: No errors. Method properly typed.

- [ ] **Step 4:** Commit

```bash
git add backend/src/modules/core/services/workspace-profile.service.ts
git commit -m "feat: add createDefaultWorkspace factory method to WorkspaceProfileService"
```

---

## Task 4: Integrate Workspace Auto-Provisioning into AgencyProvisioningService

**Files:**
- Modify: `backend/src/modules/agencies/services/provisioning.service.ts`

**Interfaces:**
- Consumes: `WorkspaceProfileService.createDefaultWorkspace(workspaceId, agencyId)`
- Produces: Updated `createAgency` and `completeAgencySetup` methods that provision workspaces

**Steps:**

- [ ] **Step 1:** Add imports to provisioning.service.ts (top of file)

```typescript
import { WorkspaceProfileService } from '../../core/services/workspace-profile.service.js';
```

- [ ] **Step 2:** Update constructor to accept db parameter for WorkspaceProfileService

Replace:
```typescript
export class AgencyProvisioningService {
    constructor(private logger: FastifyBaseLogger) {}
```

With:
```typescript
export class AgencyProvisioningService {
    private workspaceProfileService: WorkspaceProfileService;

    constructor(
        private logger: FastifyBaseLogger,
        private dbConnection?: NodePgDatabase<any>
    ) {
        this.workspaceProfileService = new WorkspaceProfileService(
            dbConnection || db,
            logger
        );
    }
```

- [ ] **Step 3:** Add import for NodePgDatabase type at top

```typescript
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
```

- [ ] **Step 4:** Update `createAgency` method to provision workspace

Replace the entire method with:
```typescript
async createAgency(input: CreateAgencyInput) {
    try {
        const validated = createAgencySchema.parse(input);
        const [agency] = await db
            .insert(agencies)
            .values({
                ...validated,
                status: 'pending',
                isActive: true,
            })
            .returning();

        // Create default workspace for the agency
        const workspaceId = `workspace-${agency.id}-${Date.now()}`;
        await this.workspaceProfileService.createDefaultWorkspace(
            workspaceId,
            agency.id
        );

        const result = await this.completeAgencySetup({
            companyName: agency.name,
            domain: agency.domain,
            adminEmail: agency.contactEmail || 'admin@example.com',
            password: 'OruPassword123!',
            plan: agency.subscriptionPlan as any,
            id: agency.id,
        });

        this.logger.info(
            { agencyId: agency.id, workspaceId },
            'Agency created with default workspace provisioned'
        );

        return { agency, jobId: result.jobId, workspaceId };
    } catch (error) {
        this.logger.error({ error, context: 'createAgency', input });
        throw new AppError('Failed to create agency');
    }
}
```

- [ ] **Step 5:** Update route handler to pass db connection

In `backend/src/modules/agencies/routes.ts`, update the service instantiation:

Find:
```typescript
const provisioning = new AgencyProvisioningService(fastify.log);
```

Replace with:
```typescript
const provisioning = new AgencyProvisioningService(fastify.log, db);
```

And add import:
```typescript
import { db } from '../../../infrastructure/database/index.js';
```

- [ ] **Step 6:** Run TypeScript check

```bash
cd backend && npm run tsc
```

Expected: No errors. Workspace provisioning wired into agency creation.

- [ ] **Step 7:** Commit

```bash
git add backend/src/modules/agencies/services/provisioning.service.ts backend/src/modules/agencies/routes.ts
git commit -m "feat: integrate workspace auto-provisioning into agency creation flow"
```

---

## Task 5: Wire AdaptiveNavigation into App Shell

**Files:**
- Modify: `frontend/src/shared/layout/Shell.tsx` (or current layout file)

**Interfaces:**
- Consumes: `useAdaptiveNav()` hook that returns sidebar navigation items
- Produces: Shell component with adaptive navigation sidebar

**Steps:**

- [ ] **Step 1:** Locate the current sidebar/navigation component

```bash
cd frontend && grep -r "AdaptiveNavigation" src/
```

This should show where AdaptiveNavigation component is located.

- [ ] **Step 2:** Update Shell.tsx to import and use AdaptiveNavigation

Find the sidebar/navigation section and add:

```typescript
import { AdaptiveNavigation } from '@/modules/core/components/AdaptiveNavigation';
```

- [ ] **Step 3:** Replace static sidebar with adaptive component

Find the static navigation/sidebar rendering and replace with:

```typescript
<aside className="bg-gray-50 border-r border-gray-200">
  <AdaptiveNavigation />
</aside>
```

- [ ] **Step 4:** Verify no TypeScript errors

```bash
cd frontend && npm run tsc
```

Expected: No errors. Navigation component properly integrated.

- [ ] **Step 5:** Commit

```bash
git add frontend/src/shared/layout/Shell.tsx
git commit -m "feat: integrate AdaptiveNavigation into app shell sidebar"
```

---

## Task 6: Update Dashboard Route to Use AdaptiveDashboard

**Files:**
- Modify: `frontend/src/routes.tsx`

**Interfaces:**
- Consumes: `AdaptiveDashboard` component from core modules
- Produces: Updated route configuration using adaptive dashboard

**Steps:**

- [ ] **Step 1:** Locate dashboard route in routes.tsx

```bash
cd frontend && grep -n "dashboard\|Dashboard" src/routes.tsx
```

- [ ] **Step 2:** Find the current dashboard route import

It likely imports from a static dashboard page. Locate the import line.

- [ ] **Step 3:** Replace with AdaptiveDashboard import

Replace the import like:
```typescript
import { AdaptiveDashboard } from '@/modules/core/pages/AdaptiveDashboard';
```

- [ ] **Step 4:** Update route definition

Replace the dashboard route object:

```typescript
{
  path: '/',
  element: <AdaptiveDashboard />,
},
```

- [ ] **Step 5:** Run TypeScript check

```bash
cd frontend && npm run tsc
```

Expected: No errors. Dashboard route properly wired.

- [ ] **Step 6:** Commit

```bash
git add frontend/src/routes.tsx
git commit -m "feat: update dashboard route to use AdaptiveDashboard component"
```

---

## Task 7: Add Workspace Context Provider to App Shell

**Files:**
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: Workspace profile hooks (useWorkspaceProfile, useCapabilities)
- Produces: App-level provider wrapping routes for workspace data access

**Steps:**

- [ ] **Step 1:** Add imports to App.tsx

At the top after existing imports, add:

```typescript
import { useWorkspaceProfile } from '@/modules/core/hooks/useWorkspaceProfile';
import { useCapabilities } from '@/modules/core/hooks/useCapabilities';
```

- [ ] **Step 2:** Create WorkspaceContextProvider component

Add before the `AppContent` component definition:

```typescript
const WorkspaceContextProvider = ({ children }: { children: React.ReactNode }) => {
  // Pre-fetch workspace data so it's available to all nested components
  useWorkspaceProfile();
  useCapabilities();
  
  return <>{children}</>;
};
```

- [ ] **Step 3:** Wrap AppRoutes with provider

In the `AppContent` component, find the `<AppRoutes />` line and wrap it:

```typescript
<WorkspaceContextProvider>
  <AppRoutes />
</WorkspaceContextProvider>
```

- [ ] **Step 4:** Run TypeScript check

```bash
cd frontend && npm run tsc
```

Expected: No errors. Workspace context available to all routes.

- [ ] **Step 5:** Commit

```bash
git add frontend/src/App.tsx
git commit -m "feat: add workspace context provider to app shell for reactive data access"
```

---

## Task 8: Verify End-to-End Integration

**Files:**
- No code changes; verification only

**Steps:**

- [ ] **Step 1:** Start backend server

```bash
cd backend && npm run dev
```

Wait for "Listening on..." message.

- [ ] **Step 2:** Start frontend dev server (in new terminal)

```bash
cd frontend && npm run dev
```

Wait for "Local: http://localhost:5173" message.

- [ ] **Step 3:** Create test agency via signup flow

Navigate to signup form and create an agency with:
- Email: `test@example.com`
- Agency: `Test Agency`
- Domain: `test-agency-$(date +%s)`
- Password: Any valid password

- [ ] **Step 4:** Verify workspace was auto-created in database

```bash
psql $DATABASE_URL -c "SELECT id, workspace_id FROM workspaces WHERE agency_id = (SELECT id FROM agencies WHERE name = 'Test Agency') LIMIT 1;"
```

Expected: Returns one workspace row.

- [ ] **Step 5:** Check workspace profile initialized

```bash
psql $DATABASE_URL -c "SELECT id, modules_json FROM workspace_profiles LIMIT 1;"
```

Expected: Profile exists with modules_json showing active/available/disabled modules.

- [ ] **Step 6:** Log in and verify dashboard loads

Navigate to dashboard and check:
- Sidebar shows AdaptiveNavigation with enabled modules
- Dashboard displays AdaptiveDashboard with onboarding flow
- No console errors

- [ ] **Step 7:** Test module toggle

Click module toggle to enable/disable a module. Verify:
- Activity logged to workspace_activity table
- Sidebar updates in real-time
- Module appears/disappears from navigation

- [ ] **Step 8:** Commit verification notes (if no code changes needed)

```bash
git log --oneline -n 8
```

Expected: All 7 commits present from Tasks 1-7.

---

## Final Checklist

- [ ] All TypeScript checks pass (`npm run tsc` in both backend and frontend)
- [ ] All 8 tasks committed with clear messages
- [ ] Workspace auto-provisions on agency creation (verified in DB)
- [ ] Shell integration loads without errors
- [ ] Dashboard renders adaptive components
- [ ] No `any` type annotations in new code
- [ ] File size limits respected (services ≤300L, routes ≤150L, components ≤200L)
- [ ] Activity logging working for workspace creation and module toggles
