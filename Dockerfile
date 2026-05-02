# Use Node.js stage for building and running the app
FROM node:20-slim AS base

# --- Build Stage ---
FROM base AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build the app
COPY . .
RUN npm run build

# --- Production Stage ---
FROM base AS production
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built assets from the build stage
COPY --from=build /app/dist ./dist
# Copy the server script
COPY --from=build /app/server.js ./

# Set environment to production
ENV NODE_ENV=production

# The port Cloud Run will listen on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
