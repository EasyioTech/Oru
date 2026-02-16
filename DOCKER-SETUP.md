# Oru ERP - Production Docker Setup

This directory now contains a complete production-ready Docker setup with all the files you need.

## Files Created

### Core Docker Files
- `docker-compose.prod.yml` - Main production Docker Compose file
- `Dockerfile.backend` - Production-optimized backend Dockerfile
- `Dockerfile.frontend` - Production-optimized frontend Dockerfile
- `nginx.conf` - Production Nginx configuration

### Deployment Scripts
- `deploy.sh` - Linux/macOS deployment script
- `deploy.ps1` - Windows PowerShell deployment script
- `DEPLOYMENT.md` - Complete deployment documentation

### Existing Files Used
- `.env.vps` - Environment configuration (already exists)
- `.dockerignore` - Docker ignore file (already exists)

## Quick Deployment

### Windows
```powershell
# One command deployment
.\deploy.ps1

# With cleanup and logs
.\deploy.ps1 -Clean -Logs
```

### Linux/macOS
```bash
# One command deployment
chmod +x deploy.sh
./deploy.sh

# With cleanup and logs
./deploy.sh --clean --logs
```

## Features

### Production Ready
- ✅ Multi-stage Docker builds for optimization
- ✅ Security hardening (non-root users, security headers)
- ✅ Health checks for all services
- ✅ Automatic restarts
- ✅ Persistent data volumes
- ✅ Rate limiting and DDoS protection
- ✅ SSL/HTTPS support
- ✅ Performance optimizations

### Services Included
- PostgreSQL 15 (Database)
- Redis 7 (Cache)
- Backend API (Node.js)
- Frontend (React + Nginx)
- Nginx Reverse Proxy (Optional)

### Environment Configuration
- Uses `.env.vps` for all configuration
- No hardcoded secrets
- Production-optimized defaults
- CORS and security headers configured

## Next Steps

1. **Review Configuration**: Check `.env.vps` and update domains/URLs
2. **Deploy**: Run the deployment script for your platform
3. **Configure SSL**: Set up SSL certificates for production
4. **Monitor**: Check health endpoints and logs
5. **Backup**: Set up automated backup strategy

## Support

See `DEPLOYMENT.md` for detailed documentation, troubleshooting, and maintenance procedures.
