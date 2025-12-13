# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Accept API URL build argument
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application
# Standard Next.js build is already minified and optimized for production.
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only necessary files from builder
# Next.js "standalone" output traces dependencies and creates a minimal server
# You must enable 'output: "standalone"' in next.config.mjs for this to work perfectly.
COPY --from=builder /app/public ./public

# Set permissions for pre-rendered cache
RUN mkdir .next
RUN chown nextjs:nextjs .next

# Copy the standalone build
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
