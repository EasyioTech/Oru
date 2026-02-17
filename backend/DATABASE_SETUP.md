# 🗄️ Database Setup Guide

## Overview
This guide explains how to set up the main `oru` database for the Oru ERP system. The main database stores control plane data (agencies, users, system settings), while each agency gets its own isolated database.

---

## 📁 Database Files Location

### Main Database Creation
**File:** `backend/src/scripts/create-main-db.ts`
- Creates the main `oru` database
- Checks if database already exists
- Provides helpful error messages

### Database Schema
**File:** `backend/src/infrastructure/database/schema.ts`
- Contains all Drizzle ORM table definitions
- Includes both main DB tables and agency-specific tables
- **Main DB Tables:**
  - `agencies` - Agency/tenant information
  - `users` - User accounts
  - `agencyProvisioningJobs` - Background jobs for agency setup

### Database Configuration
**File:** `backend/drizzle.config.ts`
- Drizzle Kit configuration
- Points to schema file
- Database connection settings

### Connection Manager
**File:** `backend/src/infrastructure/database/index.ts`
- Manages database connections
- Provides `db` for main database
- Provides `getAgencyDb(name)` for agency databases
- Caches connections for performance

---

## 🚀 Step-by-Step Setup

### Step 1: Create the Main Database
```bash
cd d:\buildsite-flow\backend
npm run db:create
```

**What this does:**
- Connects to PostgreSQL server
- Creates the `oru` database if it doesn't exist
- Shows helpful error messages if PostgreSQL is not running

**Expected Output:**
```
✅ Connected to PostgreSQL server
✅ Created database "oru"
✅ Database setup complete!

📊 Database Details:
   Name: oru
   Host: localhost:5432
   User: postgres

🚀 Next steps:
   1. Run: npm run db:push
   2. Run: npm run dev
```

---

### Step 2: Push Schema to Database
```bash
npm run db:push
```

**What this does:**
- Reads your `schema.ts` file
- Compares it with the actual database
- Creates/updates tables to match your schema
- **Creates these main tables:**
  - `agencies`
  - `users`
  - `agency_provisioning_jobs`

**Expected Output:**
```
✅ Schema pushed successfully
```

---

### Step 3: Start the Development Server
```bash
npm run dev
```

**What this does:**
- Starts Fastify server on port 5001
- Watches for file changes (hot reload)
- Connects to the main database
- Registers all routes and plugins

**Expected Output:**
```
🚀 Oru High-Tech ERP is soaring on port 5001
```

---

## 📊 Database Structure

### Main Database (`oru`)
**Purpose:** Control plane for the entire system

**Tables:**

#### 1. `agencies`
Stores information about each tenant/agency.
```typescript
{
  id: uuid,
  name: string,
  slug: string (unique),
  domain: string (unique),
  databaseName: string (unique),
  status: 'active' | 'suspended' | 'pending' | 'trial' | 'cancelled',
  tier: 'free' | 'starter' | 'professional' | 'enterprise',
  ownerEmail: string,
  maxUsers: number,
  maxStorageGB: number,
  features: { inventory, hr, crm, projects, accounting },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. `users`
Global user accounts (can belong to agencies).
```typescript
{
  id: uuid,
  email: string (unique),
  passwordHash: string,
  name: string,
  role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'accountant' | 'viewer',
  agencyId: uuid (references agencies),
  emailVerified: boolean,
  twoFactorEnabled: boolean,
  twoFactorSecret: string,
  lastLogin: timestamp,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. `agency_provisioning_jobs`
Tracks background jobs for creating agency databases.
```typescript
{
  id: uuid,
  agencyId: uuid,
  status: 'pending' | 'running' | 'completed' | 'failed',
  progress: number (0-100),
  steps: json[],
  error: string,
  startedAt: timestamp,
  completedAt: timestamp,
  createdAt: timestamp
}
```

---

### Agency Databases (e.g., `agency_acme`)
**Purpose:** Isolated data for each tenant

**Tables:** (defined in same schema.ts but created per-agency)
- `departments`
- `employees`
- `attendance`
- `leaves`
- `customers`
- `leads`
- `products`
- `stock_movements`
- `invoices`
- `invoice_items`
- `payments`
- `expenses`
- `projects`
- `tasks`
- `audit_logs`

---

## 🔧 Available Database Scripts

### `npm run db:create`
Creates the main `oru` database.
- **File:** `src/scripts/create-main-db.ts`
- **Use when:** First time setup or after dropping database

### `npm run db:push`
Pushes schema changes to database.
- **Uses:** Drizzle Kit
- **Use when:** Schema changes need to be applied

### `npm run db:generate`
Generates SQL migration files.
- **Creates:** Migration files in `drizzle/` folder
- **Use when:** You want version-controlled migrations

### `npm run db:studio`
Opens Drizzle Studio (visual database browser).
- **URL:** http://localhost:4983
- **Use when:** You want to view/edit data visually

---

## 🔍 Troubleshooting

### Error: "database 'oru' does not exist"
**Solution:**
```bash
npm run db:create
```

### Error: "password authentication failed"
**Check:** `.env` file in project root
```env
POSTGRES_PASSWORD=admin
POSTGRES_USER=postgres
```

### Error: "ECONNREFUSED"
**Solution:** Make sure PostgreSQL is running
```bash
# Windows: Check if PostgreSQL service is running
# Or start it from pgAdmin
```

### Error: "schema is invalid: data/required must be array"
**Solution:** This was fixed by updating auth routes to use Zod validation directly instead of passing Zod schemas to Fastify's schema option.

---

## 🔐 Environment Variables

Required in `.env` file (in project root):

```env
# Database
DATABASE_URL=postgres://postgres:admin@localhost:5432/oru
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
MAIN_DB_NAME=oru

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
```

---

## 📝 Making Schema Changes

### 1. Edit the Schema
Edit `backend/src/infrastructure/database/schema.ts`

Example - Adding a new field to users:
```typescript
export const users = pgTable('users', {
  // ... existing fields ...
  phoneNumber: text('phone_number'), // NEW FIELD
});
```

### 2. Push Changes
```bash
npm run db:push
```

Drizzle will automatically:
- Detect the new field
- Generate the ALTER TABLE statement
- Apply it to the database

### 3. Verify
```bash
npm run db:studio
```
Open Drizzle Studio to see the new field.

---

## 🎯 Next Steps After Setup

1. ✅ **Database Created** - `npm run db:create`
2. ✅ **Schema Pushed** - `npm run db:push`
3. ✅ **Server Running** - `npm run dev`
4. 🔜 **Create First Agency** - Use agency creation API
5. 🔜 **Test Authentication** - Register/login users
6. 🔜 **Explore API** - http://localhost:5001/health

---

## 📚 Additional Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team/
- **Fastify Docs:** https://fastify.dev/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Last Updated:** 2026-02-16  
**Status:** ✅ Ready for Development
