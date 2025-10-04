# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Install netcat and openssl for database health check and Prisma
RUN apk add --no-cache netcat-openbsd openssl

COPY package*.json ./
RUN npm install

COPY . .

# Make startup script executable
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install netcat and openssl for database health check and Prisma
RUN apk add --no-cache netcat-openbsd openssl

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Build the application
RUN npm run build

# Make startup script executable
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]