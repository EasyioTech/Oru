# Known Issues & Solutions

## 1. Drizzle-Kit Installation Issue
**Problem**: `drizzle-kit` can't find `drizzle-orm` even though it's installed

**Cause**: Workspace/monorepo structure issue with npm

**Solutions**:
```bash
# Option 1: Install in root
cd d:\buildsite-flow
npm install drizzle-orm drizzle-kit

# Option 2: Use npx
cd backend
npx drizzle-kit push

# Option 3: Manual migration
npx tsx src/scripts/migrate.ts
```

## 2. NPM Vulnerabilities (44 total)
**Status**: 10 moderate, 34 high

**Note**: Most are in dev dependencies and don't affect production

**Action**: 
- Ignore dev dependency vulnerabilities for now
- Focus on production dependencies
- Will address in security audit phase

**Why Not Fix Now**:
- `npm audit fix --force` may break dependencies
- Many are transitive dependencies we don't control
- Better to wait for library updates

## 3. Workaround for Schema Push

Since `drizzle-kit push` has issues, use direct SQL:

```bash
# Generate migration SQL
npx drizzle-kit generate

# Apply manually
psql -U postgres -d oru -f drizzle/0000_*.sql
```

## Status
- ✅ Schema created (20 tables)
- ⏳ Schema push (workaround needed)
- ⏳ Vulnerabilities (acceptable for dev)
