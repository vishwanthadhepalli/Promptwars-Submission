# Base image shared across stages
FROM node:20-slim AS base

# --- Build Stage ---
FROM base AS build
WORKDIR /app

# Copy lockfile explicitly for deterministic installs
COPY package.json package-lock.json ./
RUN npm ci

# Copy source (make sure .dockerignore excludes node_modules, .env, dist)
COPY . .
RUN npm run build

# --- Production Stage ---
FROM base AS production

# Create app directory with correct ownership BEFORE switching user
RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

# Switch to non-root user early so all subsequent layers are owned correctly
USER node

# Use deterministic, production-only install
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built assets from build stage
COPY --chown=node:node --from=build /app/dist ./dist

# Copy server entry point directly from source context
COPY --chown=node:node server.js ./

# Set environment
ENV NODE_ENV=production

# Cloud Run listens on this port
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]

