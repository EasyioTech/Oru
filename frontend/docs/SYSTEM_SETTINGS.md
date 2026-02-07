# System Settings – Architecture & Best Practices

This document describes how system settings work end-to-end: where they live, how validation and secrets are handled, and how to work with them safely.

## Overview

- **Backend**: Single source of truth. All validation and secret masking happen on the server.
- **Frontend**: Fetches masked settings, sends only changed fields, and strips masked values (`***`) before PUT so existing secrets are never overwritten.
- **Schema**: The `system_settings` table is created only by database migrations; the backend does not run DDL in the request path.

## File Locations

| Layer   | File / Path | Purpose |
|--------|--------------|---------|
| DB     | `database/migrations/12_system_settings_schema.sql` | Creates `system_settings` table |
| Backend | `backend/src/utils/systemSettings.js` | Cached read (`getSystemSettings`), `getEmailConfig`, `getSecurityConfig`, `clearSettingsCache` |
| Backend | `backend/src/services/systemSettingsService.js` | GET/PUT API logic: validation, secret masking, allowed fields, numeric/string rules |
| Backend | `backend/src/routes/system.js` | Routes: `GET /api/system/settings`, `PUT /api/system/settings`, `GET /api/system/maintenance-status` |
| Frontend | `frontend/src/services/system-settings.ts` | `fetchSystemSettings()`, `updateSystemSettings()`, `stripMaskedSecrets()` |
| Frontend | `frontend/src/components/system/SystemSettings.tsx` | Super Admin settings UI (tabs: Identity, Branding, SEO, etc.) |
| Frontend | `frontend/src/hooks/useSystemSettings.ts` | Hook that uses `fetchSystemSettings` |

## Validation: No Duplication

- **Backend** (`systemSettingsService.js`): Defines `ALLOWED_SETTINGS_FIELDS`, `NUMERIC_RANGES`, `STRING_MAX_LENGTHS`, URL checks, and runs `validateUpdates()` on every PUT. Rejects unknown fields and invalid values.
- **Frontend**: Does **not** duplicate allowed fields or numeric/string rules. It only:
  - Strips keys whose value is `***` (or literal `'***'`) so masked secrets are never sent in PUT body.
  - Sends the same TypeScript type shape for type safety and editor support.

So validation is centralized on the backend; the frontend avoids overwriting secrets and keeps types in sync.

## API Behaviour

- **GET /api/system/settings**  
  - Requires super_admin.  
  - Returns one settings object; sensitive fields are replaced with `***`.  
  - Uses shared cache from `utils/systemSettings.js` where applicable.

- **PUT /api/system/settings**  
  - Requires super_admin.  
  - Body: partial object of allowed fields.  
  - Backend ignores keys not in `ALLOWED_SETTINGS_FIELDS` and treats `***` as “leave existing value”.  
  - Responds with full updated settings (masked).  
  - On validation failure: 400 with `VALIDATION_ERROR` and details.

- **GET /api/system/maintenance-status**  
  - Public, no auth.  
  - Returns `maintenance_mode` and `maintenance_message` (fails open to `false`/null on error).

## Sensitive Fields

Backend masks these in GET and in PUT response:  
`smtp_password`, `sendgrid_api_key`, `mailgun_api_key`, `aws_access_key_id`, `aws_secret_access_key`, `aws_s3_access_key_id`, `aws_s3_secret_access_key`, `resend_api_key`, `captcha_secret_key`, `sentry_dsn`.

Frontend must never send `***` as a new value; `stripMaskedSecrets()` ensures that.

## Best Practices

1. **Schema changes**: Add or change columns only via new migrations. Do not add DDL in `systemSettingsService.js` or route handlers.
2. **New settings**: Add the column in a migration, then add the key to `ALLOWED_SETTINGS_FIELDS` (and optionally `SENSITIVE_FIELDS`, `NUMERIC_RANGES`, or `STRING_MAX_LENGTHS`) in `systemSettingsService.js`. Update frontend type and UI as needed.
3. **Caching**: After PUT, the service calls `clearSettingsCache()`. Other code should read via `getSystemSettings()` (or dedicated helpers like `getEmailConfig`) so they see updated values after cache clear.
4. **Errors**: Handle 400 (validation) and 5xx (e.g. DB) in the UI; show backend `error.message` or `details` when present.

## Docker / Deployment

See [SYSTEM_SETTINGS_DOCKER_DEPLOYMENT.md](./SYSTEM_SETTINGS_DOCKER_DEPLOYMENT.md) for migration and deployment steps. Ensure migrations have run so `system_settings` exists before using GET/PUT settings or maintenance-status.
