# Backend Implementation Guide

## Setup
```bash
npm install
npm run db:push
npm run dev
```

## Stack
- **Fastify** - Web framework
- **Drizzle ORM** - Database
- **Zod** - Validation
- **CASL** - Authorization
- **BullMQ** - Jobs
- **Sentry** - Monitoring

## Structure
```
src/
├── infrastructure/  # DB, Redis, S3
├── modules/        # Features (auth, agencies, etc)
├── plugins/        # Fastify plugins
├── utils/          # Helpers
├── jobs/           # Background jobs
└── server.ts       # Entry point
```

## Rules
See `AI_RULES.md` for strict development guidelines.

## Environment
```env
DATABASE_URL=postgres://postgres:admin@localhost:5432/oru
DATABASE_URL_TEMPLATE=postgres://postgres:admin@localhost:5432/{db}
JWT_SECRET=<64-char-secret>
REDIS_URL=redis://localhost:6379
SENTRY_DSN=<your-dsn>
```

## Commands
- `npm run dev` - Development
- `npm run build` - Production build
- `npm run db:push` - Sync schema
- `npm test` - Run tests
- `npm run typecheck` - Type check
