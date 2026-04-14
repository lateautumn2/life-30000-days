FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production image
FROM node:20-bookworm-slim

WORKDIR /app

# Install build dependencies to compile native modules during npm ci
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Install production dependencies (force build from source to avoid GLIBC mismatch)
COPY package*.json ./
ENV npm_config_build_from_source=true
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Install tsx to run typescript directly
RUN npm install -g tsx

# Expose port and configure environment
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/database.sqlite

# Start the application
CMD ["tsx", "api/server.ts"]
