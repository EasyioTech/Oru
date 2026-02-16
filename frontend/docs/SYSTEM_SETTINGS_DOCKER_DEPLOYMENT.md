# System Settings - Docker Production Deployment

## ✅ Implementation Complete

The system settings feature is **fully Docker-compatible** and production-ready.

## 📋 What Was Implemented

1. **Database Migration** (`database/migrations/12_system_settings_schema.sql`)
   - Creates `system_settings` table with all configuration fields
   - Idempotent (safe to run multiple times)
   - Docker-compatible (runs automatically on first database init)

2. **Backend API** (`backend/src/routes/system.js`)
   - `GET /api/system/settings` - Fetch settings (super admin only). Secrets are masked.
   - `PUT /api/system/settings` - Update settings (super admin only). Validated; masked fields omitted.
   - Schema is defined only in migrations (no DDL in request path). Run migrations so `system_settings` exists.

3. **Frontend Component** (`frontend/src/components/system/SystemSettings.tsx`)
   - Settings UI with 10 tabs (Identity, Branding, SEO, Analytics, Ads, Email, Security, Storage, API, Other)
   - Integrated into Super Admin dashboard at `/super-admin/system-settings`

## 🐳 Docker Deployment

### Automatic Migration (New Databases)

When you start Docker with a fresh database, the migration runs automatically:

```bash
# The migration is mounted in docker-compose files:
volumes:
  - ./database/migrations:/docker-entrypoint-initdb.d
```

PostgreSQL automatically executes all `.sql` files in `/docker-entrypoint-initdb.d` on first initialization.

### Existing Production Databases

For **existing production databases**, the migration will NOT run automatically (PostgreSQL only runs init scripts on first init).

**Solution**: Run the migrations manually (see Manual Migration below). The backend assumes the `system_settings` table exists (schema is defined only in migrations; no DDL in request path). On first GET/PUT, the service ensures one row exists (inserts defaults if none).

### Manual Migration (Optional)

If you want to run the migration manually in Docker:

```bash
# Connect to PostgreSQL container
docker compose exec postgres psql -U postgres -d oru_erp

# Or run migration file directly
docker compose exec -T postgres psql -U postgres -d oru_erp -f /docker-entrypoint-initdb.d/12_system_settings_schema.sql

# Or from host machine
docker compose exec postgres psql -U postgres -d oru_erp < database/migrations/12_system_settings_schema.sql
```

## 🚀 Deployment Steps

### 1. Build and Deploy

```bash
# Build images
docker compose -f docker-compose.hostinger-ready.yml build

# Start services
docker compose -f docker-compose.hostinger-ready.yml up -d

# Check logs
docker compose -f docker-compose.hostinger-ready.yml logs -f backend
```

### 2. Verify Migration

```bash
# Check if table exists
docker compose exec postgres psql -U postgres -d oru_erp -c "\d public.system_settings"

# Check if default settings exist
docker compose exec postgres psql -U postgres -d oru_erp -c "SELECT system_name, system_tagline FROM public.system_settings;"
```

### 3. Access Settings

1. Log in as super_admin (e.g. via `/sauth` or main login).
2. Open Super Admin dashboard and go to **System Settings** (`/super-admin/system-settings`).

The `system_settings` table is created by database migrations only; the backend does not run DDL. Ensure migrations have run before using settings.

## 🔒 Security

- **Super Admin Only**: All endpoints require `super_admin` role
- **Authentication Required**: All requests must include valid JWT token
- **Database Isolation**: Settings stored in main database, not agency databases

## 📝 Settings Categories

1. **Identity** - System name, tagline, description, language, timezone
2. **Branding** - Logos (main, favicon, login, email)
3. **SEO** - Meta tags, Open Graph, Twitter cards
4. **Analytics** - Google Analytics, Tag Manager, Facebook Pixel, custom tracking
5. **Advertising** - Ad network settings and placement options
6. **Other** - Contact info, social media, legal links, maintenance mode

## ✅ Verification Checklist

- [x] Migration file is Docker-compatible
- [x] Schema is migration-only (no DDL in request path)
- [x] Frontend component integrated
- [x] All fields properly typed
- [x] Error handling implemented
- [x] Security (super_admin only) enforced
- [x] No linting errors

## 🎯 Status

**✅ COMPLETE AND PRODUCTION-READY**

The system settings feature is fully implemented and ready for Docker production deployment. Run database migrations so `system_settings` exists; the backend does not create the table.

