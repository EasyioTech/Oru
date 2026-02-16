
# Quick API Testing Guide

## Prerequisites
1. Backend running on port 3000
2. Valid JWT token from `/api/auth/login-sauth`
3. Super Admin user credentials

## Get Authentication Token

```bash
curl -X POST http://localhost:3000/api/auth/login-sauth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oru.com",
    "password": "your-password"
  }'
```

Save the `access_token` from response.

## Test All Endpoints

### 1. System Metrics
```bash
curl http://localhost:3000/api/system/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. System Settings
```bash
curl http://localhost:3000/api/system/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Maintenance Status
```bash
curl http://localhost:3000/api/system/maintenance-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Branding
```bash
curl http://localhost:3000/api/system/branding \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Plans
```bash
curl http://localhost:3000/api/system/plans \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Page Catalog
```bash
curl http://localhost:3000/api/system/page-catalog \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. System Health
```bash
curl http://localhost:3000/api/system-health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Database Query (Super Admin Only)
```bash
curl -X POST http://localhost:3000/api/database/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM notifications LIMIT 10"
  }'
```

## Expected Response Format

All successful responses follow this structure:
```json
{
  "success": true,
  "data": { ... }
}
```

Arrays are returned directly:
```json
{
  "success": true,
  "data": [...]
}
```

## Common Issues

### 401 Unauthorized
- Token missing or expired
- Wrong Authorization header format
- User not authenticated

### 403 Forbidden
- User lacks required permissions
- Not a Super Admin for protected routes

### 500 Internal Server Error
- Database connection issue
- Unhandled exception
- Check backend logs

## Frontend Integration

The frontend should:
1. Store token in localStorage or httpOnly cookie
2. Send token in Authorization header: `Bearer ${token}`
3. Use `credentials: 'include'` for fetch/axios
4. Handle 401 by redirecting to login
5. Expect arrays directly in `data` field (not wrapped)
