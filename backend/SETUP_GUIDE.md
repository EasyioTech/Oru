# System Setup & First Steps

## 1. Prerequisites
- Node.js (v20+)
- PostgreSQL (v14+)
- Node.js (v20+)
- Docker & Docker Compose (Recommended for Redis/DB)

## 2. Infrastructure Setup (Docker)
## 2. Infrastructure Setup (Docker Production Stack)
The project is fully containerized for production.

1. **Build & Start**:
   ```bash
   docker-compose up -d --build
   ```
   *Starts Postgres (5432), Redis (6379), Backend (5001), Frontend (80).*

2. **Access**:
   - Web App: http://localhost
   - API: http://localhost/api/health or http://localhost:5001/api/health

3. **Database Migrations**:
   Run manually if not automated in startup:
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

4. **Logs**:
   ```bash
   docker-compose logs -f
   ```
2. Configure database credentials (`DATABASE_URL`).
3. Configure `JWT_SECRET`.

## 3. Database Initialization (Main System)
1. **Create Database**:
   ```bash
   npm run db:create
   ```
   *Creates the `oru` database if it doesn't exist.*

2. **Push Schema**:
   ```bash
   npm run db:push
   ```
   *Syncs the Drizzle schema to the database (creates tables).*

3. **Seed Super Admin**:
   ```bash
   npx tsx src/scripts/seed-admin.ts
   ```
   *Creates the initial system administrator account.*

## 4. Running the System
- **Development**:
  ```bash
  npm run dev
  ```
  *Starts backend on port 5001 (API) + frontend on 5173.*

- **Production**:
  ```bash
  npm start
  ```
  *Starts backend on port 5001 (API + Static Frontend).*

## 5. Accessing the Dashboard
1. Open your browser to:
   - Dev: `http://localhost:5173`
   - Prod: `http://localhost:5001`
2. Login with the seeded admin credentials (usually `admin@oru.erp` / `admin123` - check seed script output).

## 6. Agency Setup
- Navigate to `/agency-setup` to configure new tenant databases.
