
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

# Copy any other necessary files (like scripts if needed at runtime, or migrations)
# Assuming migrations are handled separately or included in dist if they are code
# If drizzle usage requires source files for migrations, we might need them.
# Usually drizzle-kit needs the schema files or migration sql files.
# Let's verify where migration files are. 
# They usually are in 'drizzle/' folder.
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.prod.ts ./

# Expose API port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
