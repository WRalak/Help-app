# Multi-stage build for production

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci
RUN cd client && npm ci
RUN cd server && npm ci

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Copy built client and server code
COPY --from=builder /app/client/build ./client/build
COPY --from=builder /app/server ./server

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]