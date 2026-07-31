# Task 2: Create Agency Data Transformer

**Goal:** Create transformer functions that convert database rows with snake_case columns to DTOs with camelCase properties.

## Requirements

Create file: `backend/src/infrastructure/transformers/agency.transformer.ts`

**Must contain two functions:**

### 1. transformAgencyRow(row: any): Agency
Converts database row (with snake_case fields like agency_id, owner_user_id) to DTO with camelCase properties.

Implementation:
```typescript
export function transformAgencyRow(row: any): Agency {
  return {
    id: row.id,
    name: row.name || row.agency_name,
    domain: row.domain,
    ownerUserId: row.owner_user_id || row.ownerUserId || null,
    subscriptionPlan: row.subscription_plan || row.subscriptionPlan || 'trial',
    status: row.status || 'active',
    maxUsers: row.max_users || row.maxUsers || 50,
    maxStorageGB: row.max_storage_gb || row.maxStorageGB || 10,
    features: row.features || [],
    settings: row.settings || {},
    contactEmail: row.contact_email || row.contactEmail || null,
    contactPhone: row.contact_phone || row.contactPhone || null,
    isActive: row.is_active !== undefined ? row.is_active : row.isActive !== undefined ? row.isActive : true,
    createdAt: new Date(row.created_at || row.createdAt),
    updatedAt: new Date(row.updated_at || row.updatedAt),
  };
}
```

### 2. transformAgencySettingsRow(row: any): AgencySettings
Converts agency_settings row to camelCase DTO.

Implementation:
```typescript
export function transformAgencySettingsRow(row: any): AgencySettings {
  return {
    id: row.id,
    agencyId: row.agency_id || row.agencyId,
    agencyName: row.agency_name || row.agencyName,
    logoUrl: row.logo_url || row.logoUrl || null,
    domain: row.domain || null,
    primaryColor: row.primary_color || row.primaryColor || '#0a6ed1',
    secondaryColor: row.secondary_color || row.secondaryColor || '#0854a0',
    timezone: row.timezone || 'UTC',
    dateFormat: row.date_format || row.dateFormat || 'YYYY-MM-DD',
    address: row.address || null,
    city: row.city || null,
    state: row.state || null,
    postalCode: row.postal_code || row.postalCode || null,
    country: row.country || null,
    createdAt: new Date(row.created_at || row.createdAt),
    updatedAt: new Date(row.updated_at || row.updatedAt),
  };
}
```

**Must import:**
- Types from Task 1: `Agency`, `AgencySettings` from '@oru/schemas'

**Then:**
- Run `cd backend && npm run typecheck` — must pass
- Commit with message: "feat: add agency data transformer for snake_case to camelCase conversion"

**Test:** TypeScript compiles without errors.
