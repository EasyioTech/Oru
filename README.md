# BuildFlow ERP

Enterprise Resource Planning System - Multi-tenant SaaS platform for agency management.

## Project Structure

```
buildflow-erp/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── stores/         # State management (Zustand)
│   │   ├── routes/         # React Router configuration
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── Dockerfile          # Production build
│   └── package.json
│
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration
│   │   ├── utils/          # Utilities & helpers
│   │   └── index.js        # Entry point
│   ├── Dockerfile          # Production build
│   └── package.json
│
├── database/               # Database files
│   └── migrations/         # SQL migrations
│
├── docker/                 # Docker configurations
│   ├── docker-compose.yml      # Production
│   └── docker-compose.dev.yml  # Development
│
├── scripts/                # Utility scripts
│   ├── backup-database.sh
│   ├── production-deploy.sh
│   └── dev-clean-start.sh
│
├── .env                    # Environment variables (DO NOT COMMIT)
└── package.json            # Root workspace config
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15 (via Docker or local)
- Redis 7 (via Docker or local)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker (recommended):**
   ```bash
   npm run docker:dev
   # Or directly:
   docker-compose -f docker/docker-compose.dev.yml up
   ```

4. **Or start manually:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - API Health: http://localhost:3000/health

### Production Deployment

```bash
# Build and start production containers
npm run docker:prod:build

# Or directly:
docker-compose -f docker/docker-compose.yml up -d --build
```

## Environment Variables

Required environment variables (set in `.env`):

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `VITE_API_URL` | API URL for frontend | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |

See `.env.example` for all available options.

## Architecture

- **Multi-tenant**: Each agency has isolated database (main DB = control plane only). See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for routing, auth flow, and validation sync.
- **Authentication**: JWT-based with RBAC; domain-first login for agency users.
- **Caching**: Redis for session and data caching
- **API**: RESTful with GraphQL support
- **Real-time**: WebSocket for live updates

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- Zustand (state management)
- React Query (data fetching)
- React Router v6

### Backend
- Node.js 20 + Express
- PostgreSQL 15
- Redis 7
- JWT Authentication
- Socket.io (WebSocket)

## Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start frontend only
npm run dev:backend         # Start backend only

# Docker
npm run docker:dev          # Start dev environment
npm run docker:prod         # Start production
npm run docker:prod:build   # Build and start production

# Testing
npm run test                # Run frontend tests
npm run test:backend        # Run backend tests

# Linting
npm run lint                # Lint frontend code
```

## License

MIT
