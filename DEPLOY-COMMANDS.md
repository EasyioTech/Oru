# Oru ERP - VPS Deployment Guide

## Quick Deployment Commands

Copy these commands and run them in order on your VPS:

### Step 1: Copy Environment
```bash
cp .env.vps .env
```

### Step 2: Stop All Containers
```bash
docker compose -f docker-compose.prod.yml down --remove-orphans --volumes
```

### Step 3: Clean Up Docker
```bash
docker system prune -f
```

### Step 4: Build Images (No Cache)
```bash
docker compose -f docker-compose.prod.yml build --no-cache
```

### Step 5: Start All Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Step 6: Check Status
```bash
docker compose -f docker-compose.prod.yml ps
```

### Step 7: View Logs (if needed)
```bash
docker compose -f docker-compose.prod.yml logs -f
```

## All-in-One Command

If you want to run everything in one command:

```bash
cp .env.vps .env && \
docker compose -f docker-compose.prod.yml down --remove-orphans --volumes && \
docker system prune -f && \
docker compose -f docker-compose.prod.yml build --no-cache && \
docker compose -f docker-compose.prod.yml up -d
```

## What Each Command Does

1. **cp .env.vps .env** - Copies production environment variables
2. **docker compose down** - Stops and removes all containers and volumes
3. **docker system prune -f** - Removes unused images, containers, networks
4. **docker compose build --no-cache** - Rebuilds all images without cache
5. **docker compose up -d** - Starts all services in detached mode

## Access Your Application

After deployment:
- Frontend: http://your-domain.com
- Backend API: http://your-domain.com/api
- Database: localhost:5432 (internal)
- Redis: localhost:6379 (internal)

## Troubleshooting

### Check Service Status
```bash
docker compose -f docker-compose.prod.yml ps
```

### View Specific Service Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs

# Specific service
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs redis
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Complete Reset
If you need to completely reset everything:

```bash
docker compose -f docker-compose.prod.yml down --remove-orphans --volumes && \
docker system prune -a -f && \
docker volume prune -f
```

## Production Notes

- Update `FRONTEND_URL` and `API_URL` in `.env.vps` with your actual domain
- Configure SSL certificates for HTTPS
- Set up firewall rules for ports 80, 443, 3000
- Configure backup strategies for data persistence
