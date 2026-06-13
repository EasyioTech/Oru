# Oru ERP — Role Credentials

All 7 valid roles with test credentials. Seed with `npm run seed:roles` from `backend/`.

---

## super_admin
- **Email:** `admin@oru.com`
- **Password:** `OruAdmin2026!`
- **Login URL:** `/sauth` ← MUST use this page, not `/auth`
- **agency_id:** `NULL` — platform-wide access

## agency_admin
- **Email:** `agency.admin@demo.oru.com`
- **Password:** `AgencyAdmin2026!`
- **Login URL:** `/auth` (domain auto-extracted as `demo.oru.com`)

## manager
- **Email:** `manager@demo.oru.com`
- **Password:** `Manager2026!`
- **Login URL:** `/auth`

## employee
- **Email:** `employee@demo.oru.com`
- **Password:** `Employee2026!`
- **Login URL:** `/auth`

## auditor
- **Email:** `auditor@demo.oru.com`
- **Password:** `Auditor2026!`
- **Login URL:** `/auth`

## viewer
- **Email:** `viewer@demo.oru.com`
- **Password:** `Viewer2026!`
- **Login URL:** `/auth`

## custom
- **Email:** `custom@demo.oru.com`
- **Password:** `Custom2026!`
- **Login URL:** `/auth`

---

## Role Hierarchy

| Role | Level | Scope |
|------|-------|-------|
| `super_admin` | 1 | Platform-wide |
| `agency_admin` | 2 | Full agency access |
| `manager` | 3 | Team/dept management |
| `employee` | 4 | Standard user |
| `auditor` | 5 | Read + audit logs |
| `viewer` | 6 | Read-only |
| `custom` | 7 | Configured per-agency |

---

## Running Dev Servers

> **Root of repo** (`d:\Oru\`)

```powershell
# Start both backend (5001) + frontend (5173) — kills any stuck process first
.\dev.ps1

# Stop everything
.\dev.ps1 -Stop

# Backend only
.\dev.ps1 -Backend

# Frontend only
.\dev.ps1 -Frontend
```

> If you already have terminals open, run manually:
> ```powershell
> # Kill whatever is on port 5001 before starting backend
> $p = (netstat -ano | Select-String ':5001').Line.Split()[-1]; Stop-Process -Id $p -Force
> cd backend; npm run dev
> ```

---

## Seed Commands

```bash
# Seed super_admin only (main DB)
npm run seed:admin

# Seed all 7 roles (super_admin in main DB + 6 agency roles in demo agency DB)
npm run seed:roles

# Target a specific agency DB
AGENCY_DATABASE_URL=postgres://... npm run seed:roles
```
