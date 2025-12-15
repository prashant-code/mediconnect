# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for tsc and obfuscator)
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Obfuscate the built code
# This modifies files in place in ./dist
RUN npx javascript-obfuscator ./dist --output ./dist --compact true --self-defending true --disable-console-output false --dead-code-injection true

# Production Stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --only=production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create logs directory and ensure permissions
RUN mkdir logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Generate Prisma Client for production
RUN npx prisma generate

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/src/server.js"]
