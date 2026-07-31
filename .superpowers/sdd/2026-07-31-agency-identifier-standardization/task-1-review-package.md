# Task 1 Review Package

## Commits
```
64ec55f feat: add agency module export to package.json
d500de1 feat: add unified agency zod schemas with camelCase output
```

## Diff Summary
```
 packages/schemas/package.json        |  1 +
 packages/schemas/src/agency/index.ts | 53 ++++++++++++++++++++++++++++++++++
 packages/schemas/src/index.ts        |  1 +
 3 files changed, 55 insertions(+)
```

## Full Diff

### packages/schemas/src/agency/index.ts (NEW)
```typescript
import { z } from 'zod';

// Output schema — ensures API response has camelCase
export const AgencySelectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  domain: z.string(),
  ownerUserId: z.string().uuid().nullable(),
  subscriptionPlan: z.enum(['trial', 'starter', 'professional', 'enterprise']),
  status: z.enum(['pending', 'active', 'suspended', 'cancelled']),
  maxUsers: z.number(),
  maxStorageGB: z.number(),
  features: z.array(z.any()).default([]),
  settings: z.record(z.any()).default({}),
  contactEmail: z.string().email().nullable(),
  contactPhone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AgencySettingsSelectSchema = z.object({
  id: z.string().uuid(),
  agencyId: z.string().uuid(),
  agencyName: z.string(),
  logoUrl: z.string().nullable(),
  domain: z.string().nullable(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Profile schema for auth context — combines agency + user data
export const AgencyProfileSchema = AgencySettingsSelectSchema.pick({
  agencyId: true,
  agencyName: true,
  logoUrl: true,
  timezone: true,
});

export type Agency = z.infer<typeof AgencySelectSchema>;
export type AgencySettings = z.infer<typeof AgencySettingsSelectSchema>;
export type AgencyProfile = z.infer<typeof AgencyProfileSchema>;
```

### packages/schemas/src/index.ts (MODIFIED)
```
+ export * from './agency/index.js';
```

### packages/schemas/package.json (MODIFIED)
```
+ "./agency": "./src/agency/index.ts"
```
