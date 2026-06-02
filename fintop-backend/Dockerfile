# ───────────────────────────────────────────────────────────
# FinTop DATA — Production Docker Build
# Multi-stage build for minimal image size
# ───────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 2: Production ────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Security: Run as non-root user
RUN addgroup -S fintop && adduser -S fintop -G fintop

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Health check for orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/liveness || exit 1

USER fintop
EXPOSE 3000

CMD ["node", "dist/main.js"]
