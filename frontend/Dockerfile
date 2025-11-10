# syntax=docker/dockerfile:1

FROM oven/bun:1.1.26-alpine AS deps
WORKDIR /app

COPY bun.lockb bun.lock package*.json ./
RUN bun install 

FROM deps AS builder
WORKDIR /app
COPY . .
RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
