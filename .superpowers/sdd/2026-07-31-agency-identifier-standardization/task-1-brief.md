# Task 1: Create Unified Agency Zod Schemas

**Goal:** Create centralized Zod schemas that enforce camelCase output for agency data across backend and frontend.

## Requirements

Create file: `packages/schemas/src/agency/index.ts`

**Must contain:**

1. `AgencySelectSchema` — z.object with exact properties:
   - `id`: z.string().uuid()
   - `name`: z.string()
   - `domain`: z.string()
   - `ownerUserId`: z.string().uuid().nullable()
   - `subscriptionPlan`: z.enum(['trial', 'starter', 'professional', 'enterprise'])
   - `status`: z.enum(['pending', 'active', 'suspended', 'cancelled'])
   - `maxUsers`: z.number()
   - `maxStorageGB`: z.number()
   - `features`: z.array(z.any()).default([])
   - `settings`: z.record(z.any()).default({})
   - `contactEmail`: z.string().email().nullable()
   - `contactPhone`: z.string().nullable()
   - `isActive`: z.boolean()
   - `createdAt`: z.date()
   - `updatedAt`: z.date()

2. `AgencySettingsSelectSchema` — z.object with exact properties:
   - `id`: z.string().uuid()
   - `agencyId`: z.string().uuid()
   - `agencyName`: z.string()
   - `logoUrl`: z.string().nullable()
   - `domain`: z.string().nullable()
   - `primaryColor`: z.string()
   - `secondaryColor`: z.string()
   - `timezone`: z.string()
   - `dateFormat`: z.string()
   - `address`: z.string().nullable()
   - `city`: z.string().nullable()
   - `state`: z.string().nullable()
   - `postalCode`: z.string().nullable()
   - `country`: z.string().nullable()
   - `createdAt`: z.date()
   - `updatedAt`: z.date()

3. `AgencyProfileSchema` = AgencySettingsSelectSchema.pick({ agencyId: true, agencyName: true, logoUrl: true, timezone: true })

4. Export types: `Agency`, `AgencySettings`, `AgencyProfile`

Then:
- Add export to `packages/schemas/src/index.ts`: `export * from './agency/index.js';`
- Run `cd packages/schemas && npm run typecheck` — must pass
- Commit with message: "feat: add unified agency zod schemas with camelCase output"

**Test:** TypeScript compiles without errors.
