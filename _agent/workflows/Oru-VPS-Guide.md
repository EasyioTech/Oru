# 🛡️ Oru VPS Management Guide

This guide documents the procedures for managing the **Oru ERP** deployment on the Hostinger VPS.

## 🚀 Server Access
The server is configured with an SSH alias for quick access.

- **IP Address:** `195.35.22.110`
- **User:** `root`
- **SSH Alias:** `oru`

**To connect:**
```powershell
ssh oru
```

## 🛠️ Deployment Workflow

### 1. Update Code from Local
After committing your changes locally and pushing to GitHub:
```powershell
ssh oru "cd Oru && git pull"
```

### 2. Rebuild and Restart Services
To apply changes (frontend, backend, or Caddy configuration):
```powershell
ssh oru "cd Oru && docker compose up -d --build"
```

### 3. Database Migrations
Always run migrations after updating the backend:
```powershell
ssh oru "cd Oru && docker compose exec -T backend npm run db:migrate:prod"
```

### 4. Seeding (Optional)
To re-seed the super admin if needed:
```powershell
ssh oru "cd Oru && docker compose exec -T backend node dist/scripts/seed-super-admin.js"
```

## 📊 Monitoring & Maintenance

### Check Resource Usage (Memory/RAM)
```powershell
ssh oru "free -m"
```

### View Live Logs
```powershell
ssh oru "cd Oru && docker compose logs -f"
```

### Check Container Status
```powershell
ssh oru "docker ps"
```

## 🔒 SSL & Domains
The system is managed by **Caddy**, which automatically handles SSL for:
- `oruerp.com`
- `oruerp.com`

**Caddy Configuration:** Located at `Oru/Caddyfile` on the server.

---
**Build with ❤️ for Oru ERP.**
