# Oru ERP - Docker Setup

## 📁 Docker Files Structure

Now simplified to only essential files:

### 🐳 Docker Compose Files
- **`docker-compose.yml`** - Development environment
- **`docker-compose.prod.yml`** - Production environment

### 📦 Dockerfiles
- **`backend/Dockerfile`** - Backend container (used by both dev & prod)
- **`frontend/Dockerfile`** - Frontend container (used by both dev & prod)

### 🗑️ Deleted Files
- `docker/` directory (removed all duplicate compose files)
- `Dockerfile.frontend` (duplicate)
- `Dockerfile.backend` (duplicate)
- All shell scripts (removed for VPS compatibility)

## 🚀 Quick Start

### Development
```bash
# Copy environment
cp .env.example .env

# Start development
docker compose up -d
```

### Production
```bash
# Copy production environment
cp .env.vps .env

# Deploy (run all commands in order)
docker compose -f docker-compose.prod.yml down --remove-orphans --volumes
docker system prune -f
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## 🔧 Environment Files

- **`.env`** - Development environment (copy from `.env.example`)
- **`.env.vps`** - Production environment (already configured)

## 📋 Services

Both environments include:
- PostgreSQL 15 (Database)
- Redis 7 (Cache)
- Backend API (Node.js)
- Frontend (React/Nginx)

## 🌐 Access URLs

### Development
- Frontend: http://localhost:5174
- Backend: http://localhost:3001

### Production
- Frontend: http://localhost:80 (or your domain)
- Backend: http://localhost:3000 (or your-domain.com/api)

## 🛠️ Useful Commands

```bash
# View logs
docker compose logs -f                    # Development
docker compose -f docker-compose.prod.yml logs -f  # Production

# Stop services
docker compose down                        # Development
docker compose -f docker-compose.prod.yml down  # Production

# Rebuild
docker compose up -d --build              # Development
docker compose -f docker-compose.prod.yml up -d --build  # Production
```

## 📝 Notes

- Both environments use the same Dockerfiles in `backend/` and `frontend/` directories
- Development uses volume mounts for hot reloading
- Production uses optimized multi-stage builds
- All configuration is handled through environment files
