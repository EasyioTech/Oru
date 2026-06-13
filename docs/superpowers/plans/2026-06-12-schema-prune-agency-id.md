# Schema Prune + Agency ID Alignment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up all Drizzle schema files to remove obsolete/over-engineered columns and ensure every tenant table carries `agency_id`.

**Architecture:** Shared-schema multi-tenancy — single `oru` database, `agency_id` FK on every tenant table as primary row-level isolation. `getAgencyDb()` already returns the shared `db` instance. App-layer `WHERE agency_id = $id` is the primary filter; PostgreSQL RLS is secondary/defense-in-depth.

**Tech Stack:** Node.js, Fastify, Drizzle ORM, PostgreSQL. Schema in `backend/src/infrastructure/database/schemas/*.ts`. Migrations via `drizzle-kit generate && drizzle-kit push`.

---

## Files Touched

| File | Action |
|------|--------|
| `schemas/agency.ts` | Remove `databaseName` column + its unique index |
| `schemas/auth.ts` | `userSessions`: add `agencyId`, remove `deviceFingerprint`; `profiles`: remove 5 personal fields |
| `schemas/users.ts` | Remove `phoneExtension` |
| `schemas/projects.ts` | Remove `currency` text cache, `categories`, `allocatedBudget` |
| `schemas/provisioning.ts` | Remove `databaseName`, `workerHostname`, `estimatedCompletionAt`, `stepsTotal` + `databaseNameIdx` |
| `schemas/system.ts` | Major prune: remove ~50 over-engineered columns |
| `schemas/catalog.ts` | Prune `pageCatalog` of 12 over-engineered columns |

---

## Task 1: agencies — remove `databaseName`

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/agency.ts`

**Why remove:** `databaseName` is an artifact of the old database-per-tenant model. The shared schema model has no concept of per-agency databases.

- [ ] Remove `databaseName: text('database_name').notNull()` from `agencies` table
- [ ] Remove `databaseNameIdx: uniqueIndex('idx_agencies_database_name')...` from table indexes
- [ ] Remove `agencySettings.defaultCurrency` text field (keep `defaultCurrencyId` FK only — dual-format causes drift)

---

## Task 2: auth — add `agencyId` to sessions, prune profiles

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/auth.ts`

**Why:** `userSessions` without `agency_id` means we can't scope session queries to a tenant. `profiles` personal fields (personal email, bio, social links) are not relevant for a work ERP.

- [ ] In `userSessions`: add `agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' })` (nullable — super_admin sessions have no agency)
- [ ] In `userSessions`: remove `deviceFingerprint: text('device_fingerprint')`
- [ ] In `userSessions`: add `agencyIdIdx: index('idx_user_sessions_agency_id').on(table.agencyId).where(sql\`agency_id IS NOT NULL AND is_active = true\`)`
- [ ] In `profiles`: remove `personalEmail`, `personalEmailVerified`, `personalEmailVerifiedAt`, `bio`, `socialLinks`

---

## Task 3: users — remove `phoneExtension`

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/users.ts`

- [ ] Remove `phoneExtension: text('phone_extension')` — not used, not needed for MVP ERP

---

## Task 4: projects — remove duplicate/redundant columns

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/projects.ts`

- [ ] Remove `currency: text('currency').default('USD').notNull()` — `currencyId` FK is the source of truth
- [ ] Remove `categories: jsonb('categories').default([]).notNull()` — redundant with `tags`
- [ ] Remove `allocatedBudget: numeric('allocated_budget', ...)` — `budget` + `actualCost` is sufficient

---

## Task 5: provisioning — remove db-per-tenant artifacts

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/provisioning.ts`

- [ ] Remove `databaseName: text('database_name').notNull()` — no longer creating databases
- [ ] Remove `databaseNameIdx` index
- [ ] Remove `workerHostname: text('worker_hostname')` — `workerId` is sufficient
- [ ] Remove `estimatedCompletionAt` — not implementing ETA tracking
- [ ] Remove `stepsTotal: integer('steps_total')` — over-engineering

---

## Task 6: system_settings — major column prune

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/system.ts`

**Remove categories:**
- Multiple logo variants: `logoLightUrl`, `logoDarkUrl`, `loginLogoUrl`, `emailLogoUrl` — keep `logoUrl` + `faviconUrl`
- All SEO meta fields: `metaTitle`, `metaDescription`, `metaKeywords`, `ogImageUrl`, `ogTitle`, `ogDescription`, `twitterCardType`, `twitterSite`, `twitterCreator`
- Analytics/tracking: `googleAnalyticsId`, `googleTagManagerId`, `facebookPixelId`, `customTrackingCode`, `customHeadScripts`, `customBodyScripts`
- Ad networks: `adNetworkEnabled`, `adNetworkCode`, `adPlacementConfig`
- Extra email providers (keep SMTP + SendGrid only): `mailgunApiKeyEncrypted`, `mailgunDomain`, `mailgunRegion`, `awsSesRegion`, `awsSesAccessKeyEncrypted`, `awsSesSecretKeyEncrypted`, `awsSesFromEmail`, `awsSesFromName`, `resendApiKeyEncrypted`, `resendFromEmail`, `resendFromName`, `postmarkApiKeyEncrypted`, `postmarkFromEmail`, `postmarkFromName`, `emailTestMode`, `emailTestRecipient`
- Session/lockout over-engineering: `sessionAbsoluteTimeoutHours`, `maxConcurrentSessions`, `progressiveLockout`
- Captcha: `enableCaptcha`, `captchaProvider`, `captchaSiteKey`, `captchaSecretKeyEncrypted`, `captchaThreshold`
- IP geo/block: `enableIpGeolocation`, `blockedCountries`, `allowedCountries`, `ipWhitelist`, `ipBlacklist`
- Storage details (use `systemStorageProviders` table): `enableVirusScanning`, `virusScanProvider`, `awsS3Bucket`, `awsS3Region`, `awsS3AccessKeyEncrypted`, `awsS3SecretKeyEncrypted`, `awsS3Endpoint`, `awsS3PublicUrl`, `cdnEnabled`, `cdnUrl`
- API docs + CORS details: `enableApiDocumentation`, `apiDocumentationUrl`, `corsAllowedMethods`, `corsAllowedHeaders`, `corsMaxAgeSeconds`
- Error/perf monitoring: `enableErrorTracking`, `sentryDsnEncrypted`, `sentryEnvironment`, `sentrySampleRate`, `enablePerformanceMonitoring`, `performanceSampleRate`
- Registration extras: `registrationRequiresApproval`, `registrationAutoVerifyEmail`, `defaultUserRole`
- Legal dates (keep version strings): `termsLastUpdated`, `privacyLastUpdated`

Also remove unused enum imports: `twitterCardEnum`, `inet` import.

---

## Task 7: page_catalog — prune over-engineered columns

**Files:**
- Modify: `backend/src/infrastructure/database/schemas/catalog.ts`

- [ ] Remove `apiQuotaDefault`, `storageQuotaMb`, `maxConcurrentUsers` — per-page quota not implemented
- [ ] Remove `seoTitle`, `seoDescription`, `seoKeywords` — per-catalog-entry SEO is overkill
- [ ] Remove `documentationUrl`, `videoTutorialUrl`, `supportEmail` — not needed now
- [ ] Remove `releaseDate`, `deprecationDate`, `replacementPageId` — premature lifecycle management
- [ ] Remove `analyticsEnabled` — all pages get analytics by default
- [ ] Remove unused `date` import if no longer needed (check: `releaseDate` and `deprecationDate` were the only `date` columns)

---

## Task 8: Run migration

- [ ] `cd backend && npx drizzle-kit generate`
- [ ] Review generated SQL, verify only expected column drops
- [ ] `npx drizzle-kit push` (dev only — prod needs proper migration)

---

## Notes

- `provisioningJobStatusEnum` still contains `'creating_database'` — removing enum values in Postgres requires DROP+RECREATE. Leave value; it's now dead but harmless.
- `userRoles.agencyId` stays nullable — super_admin roles legitimately have no agency.
- `notifications.agencyId` stays nullable — system-wide notifications are valid.
- `systemStorageProviders.config` jsonb handles S3 credentials — no need to duplicate in `systemSettings`.
