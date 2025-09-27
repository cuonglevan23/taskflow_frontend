# -------- Stage 1: Base image (shared) --------
FROM node:20-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=true

# -------- Stage 2: Dependencies install (with caching) --------
FROM base AS deps
# Enable corepack to get pnpm
RUN corepack enable
# Copy only manifest files first for better layer caching
COPY package.json pnpm-lock.yaml* ./
# Install all dependencies (prod + dev for build)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# -------- Stage 3: Build --------
FROM deps AS build
# Copy the rest of the source code
COPY . .
# Build Next.js (SSR)
RUN pnpm build

# -------- Stage 4: Production runtime (standalone) --------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone output (created because output: 'standalone' is enabled)
COPY --from=build /app/.next/standalone ./
# Static assets
COPY --from=build /app/.next/static ./.next/static
# Public assets
COPY --from=build /app/public ./public

USER nextjs
EXPOSE 3000

# server.js is at the root of the standalone bundle
CMD ["node", "server.js"]
