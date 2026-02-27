# AI Development Rules - STRICT ENFORCEMENT

## 🎯 CORE PRINCIPLES

1. **NO CUSTOM CODE** for security, auth, validation, jobs, monitoring
2. **USE PROVEN LIBRARIES** - Only battle-tested, widely-used packages
3. **TYPE SAFETY FIRST** - 100% TypeScript, no `any` types
4. **SECURITY BY DEFAULT** - Never compromise on security
5. **PERFORMANCE OPTIMIZED** - Every decision considers scale
6. **PRODUCTION READY** - This ERP serves thousands of companies

---

## 🚫 FORBIDDEN PRACTICES

### Code Generation
- ❌ NO custom authentication systems
- ❌ NO custom authorization logic (use CASL)
- ❌ NO custom validation (use Zod)
- ❌ NO custom job queues (use BullMQ)
- ❌ NO `any` types in TypeScript
- ❌ NO raw SQL queries (use Drizzle ORM)
- ❌ NO `console.log` (use Pino logger)
- ❌ NO synchronous operations in routes
- ❌ NO hardcoded secrets
- ❌ NO missing error handling
- ❌ NO temporary patches or workarounds
- ❌ NO guessing - always verify with codebase context
- ❌ NO recreating existing functionality

### Documentation
- ❌ NO long explanations (max 10-20 lines)
- ❌ NO "fluffy" content
- ❌ NO obvious statements
- ❌ NO redundant examples
- ❌ NO "best practices" sections without code
- ❌ NO theoretical discussions
- ❌ NO creating docs in random locations
- ❌ Place docs in proper module directories

### Logging
- ❌ NO debug logs in production code
- ❌ NO sensitive data in logs
- ❌ NO excessive logging
- ❌ NO unstructured log messages

---

## 🌐 FRONTEND-BACKEND API CONTRACT - CRITICAL

### Response Structure (NEVER DEVIATE)
```typescript
// ✅ ALWAYS use this structure
{
  success: true,
  data: ActualData  // Direct data, NOT wrapped
}

// ✅ For arrays - ALWAYS return array directly
{
  success: true,
  data: []  // Array, not { items: [] }
}

// ✅ For errors
{
  success: false,
  error: 'ErrorType',
  message: 'User-friendly message'
}
```

### Field Naming Convention
```typescript
// Backend (camelCase) → Frontend (snake_case)
// ALWAYS transform before sending response

// ✅ CORRECT
return { success: true, data: mapToSnakeCase(data) };

// ❌ WRONG
return { success: true, data: data };  // camelCase not transformed
```

### Array Endpoints - CRITICAL RULES
```typescript
// ✅ ALWAYS return arrays, even if empty
async listItems() {
  try {
    const items = await db.select()...
    return items || [];  // NEVER return undefined
  } catch (error) {
    return [];  // NEVER throw on list endpoints
  }
}

// ✅ Route layer safety
const items = Array.isArray(data) ? data : [];
return { success: true, data: items.map(mapToSnakeCase) };
```

### Frontend Expects These Endpoints
```
GET  /api/system/metrics
GET  /api/system/settings
PUT  /api/system/settings
GET  /api/system/maintenance-status (PUBLIC)
GET  /api/system/branding (PUBLIC)
GET  /api/system/usage/realtime
GET  /api/system/tickets/summary
GET  /api/system/features
GET  /api/system/plans
GET  /api/system/page-catalog
GET  /api/system-health
GET  /api/system/tickets?limit=100
GET  /api/email/status
POST /api/database/query (SUPER_ADMIN only)
```

### NEVER Create Missing Endpoints Without
1. Checking if frontend actually needs it
2. Implementing full CRUD if needed
3. Adding proper authentication
4. Adding CASL authorization
5. Adding error handling
6. Adding to this list

---

## ✅ REQUIRED PRACTICES

### Every Route MUST Have
```typescript
// 1. Zod schema validation
const schema = z.object({ ... });

// 2. Authentication (if protected)
{ onRequest: [fastify.authenticate] }

// 3. Authorization check (if needed)
if (!ability.can('action', 'Resource')) throw new ForbiddenError();

// 4. Comprehensive error handling
try { 
  const data = await service.getData();
  return { success: true, data: mapToSnakeCase(data) };
} catch (error) { 
  fastify.log.error({ error, context: 'route-name' });
  // NEVER throw - return safe default
  return { success: true, data: safeDefault };
}

// 5. ALWAYS return structured response
return { success: true, data: ... };
```

### Every Service MUST Have
```typescript
// 1. Type-safe Drizzle queries
const result = await db.select().from(table).where(...);

// 2. Input validation with Zod
const validated = schema.parse(input);

// 3. Defensive error handling
try { ... } catch (error) {
  this.logger.error({ error, context: '...' });
  return safeDefault;  // NEVER crash dashboard
}

// 4. Return types
async function(): Promise<ReturnType> { ... }

// 5. ALWAYS return safe defaults
return data || [];  // for arrays
return data || null;  // for objects
```

### Every File MUST Have
```typescript
// 1. Proper imports (no wildcards)
import { specific, imports } from 'module';

// 2. Type definitions
interface MyInterface { ... }
type MyType = ...;

// 3. JSDoc for public functions
/**
 * Brief description
 * @param name - Description
 * @returns Description
 */

// 4. No unused imports/variables
```

---

## 🛡️ PRODUCTION-GRADE REQUIREMENTS

### Defensive Programming (MANDATORY)
```typescript
// ✅ ALWAYS validate arrays
const safeArray = Array.isArray(data) ? data : [];

// ✅ ALWAYS validate objects
const safeObj = data && typeof data === 'object' ? data : {};

// ✅ ALWAYS handle null/undefined
const value = data?.field ?? defaultValue;

// ✅ NEVER assume data exists
// ❌ data.map(...)  // WRONG - crashes if undefined
// ✅ (data || []).map(...)  // CORRECT
```

### Error Handling Strategy
```typescript
// Route Layer: NEVER throw errors that crash UI
try {
  const data = await service.getData();
  return { success: true, data };
} catch (error) {
  fastify.log.error({ error, context: 'route' });
  return { success: true, data: safeDefault };  // Graceful degradation
}

// Service Layer: Return safe defaults
try {
  return await db.select()...
} catch (error) {
  this.logger.error({ error, context: 'service' });
  return [];  // NEVER throw on list operations
}
```

### CORS Configuration
```typescript
// MUST include these headers for frontend
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'x-agency-database',
  'X-Agency-Database',
  'Accept',
  'Origin',
  'X-Requested-With'
],
credentials: true,
```

---

## 📋 MANDATORY CHECKS BEFORE COMMIT

### Security
- [ ] All passwords hashed with bcrypt
- [ ] All routes with sensitive data require authentication
- [ ] All user input validated with Zod
- [ ] No secrets in code (use env vars)
- [ ] CASL authorization on protected resources

### Type Safety
- [ ] No `any` types
- [ ] All function parameters typed
- [ ] All return types defined
- [ ] Drizzle schema matches database

### Frontend Compatibility
- [ ] All responses use `{ success, data }` structure
- [ ] All arrays returned directly (not wrapped)
- [ ] All field names in snake_case
- [ ] All endpoints return safe defaults on error
- [ ] No undefined/null crashes possible

### Performance
- [ ] No synchronous operations in routes
- [ ] Heavy operations moved to BullMQ jobs
- [ ] Database queries optimized (indexes, select only needed fields)
- [ ] Proper error handling (no crashes)

### Code Quality
- [ ] No console.log (use Pino)
- [ ] No commented-out code
- [ ] No unused imports
- [ ] Consistent naming (camelCase for variables, PascalCase for types)
- [ ] No TODO comments without tickets

---

## 🏗️ PROJECT STRUCTURE - ENFORCE

```
backend/src/
├── infrastructure/
│   ├── database/
│   │   ├── schemas/        # Modular schemas
│   │   ├── schema.ts       # Main export
│   │   └── index.ts        # Connection manager
│   ├── redis/index.ts      # Redis client
│   └── s3/index.ts         # S3 client
├── modules/
│   └── [feature]/
│       ├── routes.ts       # Fastify routes ONLY
│       ├── service.ts      # Business logic ONLY
│       ├── schemas.ts      # Zod schemas ONLY
│       └── abilities.ts    # CASL permissions ONLY
├── plugins/
│   ├── db.ts              # Database plugin
│   ├── auth.ts            # Auth plugin
│   ├── casl.ts            # CASL plugin
│   └── sentry.ts          # Sentry plugin
├── utils/
│   ├── password.ts        # bcrypt helpers
│   ├── jwt.ts             # JWT helpers
│   ├── errors.ts          # Error classes
│   └── case-transform.ts  # snake_case/camelCase
├── jobs/
│   └── [name].job.ts      # BullMQ workers
└── server.ts              # Main entry ONLY
```

**Rule**: One file = One responsibility. No mixing.

---

## 🔒 SECURITY RULES - NON-NEGOTIABLE

1. **Passwords**: Always bcrypt with 12 rounds
2. **JWT**: Access token 15min, refresh token 7 days
3. **Secrets**: 64+ characters, in .env only
4. **Input**: Always validate with Zod before processing
5. **SQL**: Never raw queries, always Drizzle ORM
6. **Files**: Validate type, size, scan for malware
7. **Errors**: Never expose internal details to users
8. **Logs**: Never log passwords, tokens, or PII
9. **CORS**: Only allow necessary headers and origins
10. **Auth**: Public endpoints MUST NOT require authentication

---

## 🎯 IMPLEMENTATION CHECKLIST

### Starting New Feature
1. Check if endpoint already exists
2. Verify frontend actually needs it
3. Create Zod schemas first
4. Define Drizzle schema (if new tables)
5. Create service with type-safe queries
6. Create routes with validation
7. Add CASL permissions
8. Add error handling (return safe defaults)
9. Test with frontend integration
10. Verify response structure matches contract

### Before PR/Commit
1. Run `npm run typecheck` - Must pass
2. Run `npm run lint` - Must pass
3. Run `npm test` - Must pass
4. Run `npm audit` - Fix critical/high
5. Check no `console.log`
6. Check no `any` types
7. Check all TODOs resolved
8. Verify frontend integration works
9. Check no temporary patches
10. Verify all responses follow contract

---

## ⚡ QUICK REFERENCE

### Libraries to Use
- Auth: `@fastify/jwt`, `bcrypt`, `speakeasy`
- Validation: `zod`, `drizzle-zod`
- Authorization: `@casl/ability`
- Jobs: `bullmq`, `ioredis`
- Monitoring: `@sentry/node`
- Email: `nodemailer`, `mjml`
- Storage: `@aws-sdk/client-s3`
- Testing: `vitest`, `supertest`

### Never Use
- Custom auth systems
- Custom validation
- Custom job queues
- `any` type
- `console.log`
- Raw SQL
- Synchronous operations in routes
- Temporary patches
- Guesswork without context

---

---

## 🏢 MULTI-TENANCY & AGENCY PROVISIONING

### Provisioning Flow (THE GROUND REALITY)
1. **Validation**: All subdomain inputs MUST be kebab-case and reserved-word checked.
2. **Main DB Prep**:
   - Create User in Main DB.
   - Assign `agency_admin` role (NOT `admin`).
   - Create Agency record as `pending`.
3. **BullMQ Job**:
   - MUST use absolute paths for migrations (never `process.cwd()`).
   - MUST verify database existence before `CREATE DATABASE`.
   - MUST run full migrations.
   - MUST seed `system_settings` and `page_catalog` in the tenant DB.
4. **Activation**: Only mark agency `active` AFTER admin user is synced to tenant DB.

### Tenancy Connection Rules
- **Header**: Use `X-Agency-Database` (case-insensitive) for all tenant requests.
- **Isolation**: NEVER perform cross-database joins.
- **Scaling**: All agency pools MUST be managed with an eviction policy (WIP).

### Critical Fixes Needed (NEXT MOVES)
- [ ] **Role Mapping**: Update frontend `ProtectedRoute` to allow `agency_admin`.
- [ ] **Full Seeding**: Ensure background job seeds more than just the user.
- [ ] **Path Safety**: Hardcode migration directory via environment or `__dirname`.
- [ ] **Pool Safety**: Implement a Max Pool size for tenant connections.

---

**FOLLOW THESE RULES. NO EXCEPTIONS.**
**THIS SYSTEM SERVES THOUSANDS OF COMPANIES.**
**PRODUCTION QUALITY IS MANDATORY.**

