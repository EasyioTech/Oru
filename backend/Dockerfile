
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to dist/
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Copy migration files (required for backend startup)
COPY --from=builder /app/database ./database
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.prod.ts ./

# Expose API port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
