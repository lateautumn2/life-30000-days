FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
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
