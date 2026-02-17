# ============================================================================
# Oru ERP - Backend Dockerfile
# Multi-stage production build for Node.js + Express
# ============================================================================

# Stage 1: Builder - installs all dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install ALL dependencies (needed for any build steps)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci || npm install; \
    else \
        npm install; \
    fi

# Copy all source code
COPY src/ ./src/

# Verify required files exist
RUN test -f src/index.js || (echo "ERROR: src/index.js not found!" && ls -la src/ && exit 1)

# Stage 2: Production - minimal image with only production dependencies
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

# Port configuration
ARG PORT=3000
ENV PORT=$PORT

WORKDIR /app

# Copy package files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

# Install ONLY production dependencies
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci --omit=dev || npm install --omit=dev; \
    else \
        npm install --omit=dev; \
    fi && \
    rm -rf /tmp/*

# Copy runtime files from builder
COPY --from=builder /app/src/index.js ./
COPY --from=builder /app/src/routes ./routes
COPY --from=builder /app/src/services ./services
COPY --from=builder /app/src/middleware ./middleware
COPY --from=builder /app/src/config ./config
COPY --from=builder /app/src/utils ./utils
COPY --from=builder /app/src/graphql ./graphql
COPY --from=builder /app/src/infrastructure ./infrastructure

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user and directories
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/storage /app/storage/documents /app/storage/messaging /app/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=10 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start the application
CMD ["node", "index.js"]
