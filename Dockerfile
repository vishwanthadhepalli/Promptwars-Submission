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
WORKDIR /app

# Use deterministic, production-only install
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Copy server entry point directly from source context
COPY server.js ./

# Set environment
ENV NODE_ENV=production

# Drop root — run as the built-in 'node' user
USER node

# Cloud Run listens on this port
EXPOSE 3000

CMD ["node", "server.js"]

