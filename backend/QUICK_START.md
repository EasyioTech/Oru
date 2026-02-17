# 🚀 Quick Setup Commands

## First Time Setup (Run Once)

```bash
# 1. Navigate to backend
cd d:\buildsite-flow\backend

# 2. Create main database
npm run db:create

# 3. Push schema to database
npm run db:push

# 4. Start development server
npm run dev
```

---

## Daily Development

```bash
# Start backend server
cd d:\buildsite-flow\backend
npm run dev

# Start frontend (in another terminal)
cd d:\buildsite-flow\frontend
npm run dev
```

---

## Database Files Reference

| File | Purpose |
|------|---------|
| `src/scripts/create-main-db.ts` | Creates main `oru` database |
| `src/infrastructure/database/schema.ts` | All table definitions (main + agency tables) |
| `src/infrastructure/database/index.ts` | Database connection manager |
| `drizzle.config.ts` | Drizzle Kit configuration |

---

## Main Database Tables

**Created in `oru` database:**
- ✅ `agencies` - Tenant/agency information
- ✅ `users` - User accounts
- ✅ `agency_provisioning_jobs` - Background job tracking

**Created per-agency (in separate databases):**
- Employees, Attendance, Leaves
- Customers, Leads
- Products, Stock Movements
- Invoices, Payments, Expenses
- Projects, Tasks
- Audit Logs

---

## Issues Fixed

1. ✅ **Schema validation error** - Fixed Zod schema usage in Fastify routes
2. ✅ **Database doesn't exist** - Created `db:create` script
3. ✅ **Missing agencyName field** - Removed from schema to match service

---

## Test the Setup

```bash
# Check if server is running
curl http://localhost:5001/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

**Ready to develop!** 🎉
