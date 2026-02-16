# Oru ERP - Production Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- `.env.vps` file configured (copy from `.env.example`)
- At least 4GB RAM available
- At least 10GB disk space available

### One-Command Deployment

#### Windows (PowerShell)
```powershell
.\deploy.ps1
```

#### Linux/macOS (Bash)
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Manual Docker Compose
```bash
# Copy environment configuration
cp .env.vps .env

# Deploy
docker compose -f docker-compose.prod.yml up -d --build
```

## Configuration

### Environment Variables (.env.vps)

The `.env.vps` file contains all production configuration:

```bash
# Database
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_PORT=5432

# Authentication
JWT_SECRET=your-jwt-secret-min-32-characters-here

# URLs (Production)
VITE_API_URL=                    # Leave empty for same-origin
FRONTEND_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=80
REDIS_PORT=6379

# Application
NODE_ENV=production
VITE_APP_NAME=Your ERP Name
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=
REDIS_DB=0

# Email (Optional)
EMAIL_PROVIDER=smtp
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@domain.com
```

## Services

The production deployment includes:

1. **PostgreSQL Database** (Port 5432)
   - Persistent data storage
   - Automatic backups recommended
   - Health checks enabled

2. **Redis Cache** (Port 6379)
   - Session storage
   - Caching layer
   - Health checks enabled

3. **Backend API** (Port 3000)
   - Node.js application
   - Multi-stage build for optimization
   - Health checks enabled
   - Security headers

4. **Frontend** (Port 80/443)
   - React application with Nginx
   - Static asset optimization
   - Gzip compression
   - Health checks enabled

5. **Nginx Reverse Proxy** (Optional)
   - SSL termination
   - Load balancing
   - Rate limiting
   - Security headers

## Security Features

### Application Security
- Non-root Docker containers
- Security headers (CSP, HSTS, XSS Protection)
- Rate limiting on API endpoints
- Input validation and sanitization
- JWT token authentication

### Infrastructure Security
- Docker network isolation
- Volume encryption (host-dependent)
- Health monitoring
- Automatic restarts

## Performance Optimizations

### Frontend
- Static asset caching (1 year)
- Gzip compression
- Minified builds
- Lazy loading
- Service Worker support

### Backend
- Connection pooling
- Redis caching
- Optimized database queries
- Memory management
- Graceful shutdowns

## Monitoring and Logs

### Health Checks
All services include health checks:
- Database: `pg_isready`
- Redis: `redis-cli ping`
- Backend: `/health` endpoint
- Frontend: `/health` file

### Logs
Access logs via:
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Monitoring Commands
```bash
# Service status
docker compose -f docker-compose.prod.yml ps

# Resource usage
docker stats

# Disk usage
docker system df
```

## SSL/HTTPS Setup

### Option 1: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Custom Certificates
1. Place certificates in `./nginx/ssl/`
2. Uncomment HTTPS server block in `nginx.conf`
3. Update domain names
4. Restart services

## Backup Strategy

### Database Backups
```bash
# Create backup
docker exec buildflow-postgres pg_dump -U postgres oru_erp > backup.sql

# Restore backup
docker exec -i buildflow-postgres psql -U postgres oru_erp < backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec buildflow-postgres pg_dump -U postgres oru_erp > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
```

### Volume Backups
```bash
# Backup all volumes
docker run --rm -v buildflow-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
docker run --rm -v buildflow-redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz -C /data .
docker run --rm -v buildflow-backend-storage:/data -v $(pwd):/backup alpine tar czf /backup/storage_backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :80
netstat -tulpn | grep :3000

# Change ports in .env file
FRONTEND_PORT=8080
BACKEND_PORT=3001
```

#### Permission Issues
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER

# Reset permissions
docker compose -f docker-compose.prod.yml down
sudo chown -R $USER:$USER ./
docker compose -f docker-compose.prod.yml up -d
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > Increase to 8GB
```

#### Database Connection Issues
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker exec buildflow-postgres psql -U postgres -d oru_erp -c "SELECT 1;"

# Reset database
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Performance Tuning

#### Database Optimization
```sql
-- In PostgreSQL
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

#### Nginx Optimization
```nginx
# In nginx.conf
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
client_max_body_size 50M;
```

## Scaling

### Horizontal Scaling
```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
  
frontend:
  deploy:
    replicas: 2
```

### Vertical Scaling
```yaml
# Increase resource limits
backend:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 4G
      reservations:
        cpus: '1.0'
        memory: 2G
```

## Maintenance

### Updates
```bash
# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Cleanup
```bash
# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Full system cleanup
docker system prune -a -f
```

## Support

For issues and support:
1. Check logs: `docker compose -f docker-compose.prod.yml logs`
2. Verify environment: Check `.env` file
3. Check resources: `docker stats`
4. Review this troubleshooting section

## Security Checklist

- [ ] Change default passwords
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable automatic backups
- [ ] Monitor logs regularly
- [ ] Update dependencies
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts
- [ ] Test disaster recovery
- [ ] Document procedures
