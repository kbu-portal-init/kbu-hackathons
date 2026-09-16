# syntax=docker/dockerfile:1

# ==============================================================================
# Multi-Stage Production Dockerfile for Next.js (pnpm)
# Hardened according to KBU Security & Least Privilege Standards
# - Unprivileged user (UID 1001: nextjs)
# - Standalone minimal runtime layer
# - No root execution in production
# ==============================================================================

# Shared native compatibility support for build and runtime
FROM node:24-alpine AS base
RUN apk add --no-cache gcompat

# pnpm is only needed in build stages
FROM base AS build-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@10.27.0

# ------------------------------------------------------------------------------
# Stage 1: Dependency Installation Cache
# ------------------------------------------------------------------------------
FROM build-base AS deps
WORKDIR /app

# Copy lockfiles and manifests
COPY package.json pnpm-lock.yaml ./
COPY prisma7.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install dependencies using frozen lockfile
RUN pnpm i --frozen-lockfile

# ------------------------------------------------------------------------------
# Stage 2: Production Build
# ------------------------------------------------------------------------------
FROM build-base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js standalone bundle
RUN pnpm build

# ------------------------------------------------------------------------------
# Stage 3: Minimal Unprivileged Runtime
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root system group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drop root privileges permanently
USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
