# Tasks 3-7: Backend Service Updates & Schema Verification

**Goal:** Ensure all backend services transform agency data to camelCase before returning.

## Task 3: Verify Drizzle Schema (**no-op documentation**)
All fields already use camelCase in schema definitions. Database columns stay snake_case (correct).
**Action:** Just run `git add -A && git commit -m "docs: verify agency schema uses camelCase field names"` (no-op commit documenting this is correct).

## Task 4: Update Auth Service
**File:** `backend/src/modules/auth/service.ts`

**Action:**
1. Add import: `import { transformAgencySettingsRow } from '@/infrastructure/transformers/agency.transformer';`
2. Find any method returning agency data (search for "agency" in the file)
3. If found: wrap response with transformer before returning
4. Commit: "fix: ensure auth service returns camelCase agency data"

## Task 5: Update Core Service  
**File:** `backend/src/modules/core/service.ts`

**Action:**
1. Add import: `import { transformAgencySettingsRow } from '@/infrastructure/transformers/agency.transformer';`
2. Search for raw queries on agency data
3. If found: apply transformer to results
4. Commit: "fix: transform agency data in core service to camelCase"

## Task 6: Update Agencies Module Service
**Files:** 
- `backend/src/modules/agencies/service.ts`
- `backend/src/modules/agencies/services/settings.service.ts`

**Action:**
1. Add import: `import { transformAgencySettingsRow } from '@/infrastructure/transformers/agency.transformer';`
2. Find methods returning agency settings
3. Wrap with transformer before returning
4. Commit: "fix: transform agency settings to camelCase in agencies module"

## Task 7: Update useAuth Hook
**File:** `frontend/src/hooks/useAuth.tsx`

**Action:**
1. Add import: `import { AgencyProfile } from '@oru/schemas';`
2. Find where profile is set from API response
3. Ensure properties are accessed as camelCase: `agencyId`, `agencyName`, `logoUrl`, `timezone`
4. Type the profile variable: `const profile: AgencyProfile = {...}`
5. Commit: "fix: use camelCase agency properties in useAuth hook"

---

## Command Sequence

For each file:
1. Open file
2. Check for agency data access/returns
3. Add transformer import if needed
4. Apply transformer to outputs
5. Commit with provided message

**Report:** List which services were updated and which had no agency data (safe no-ops).
