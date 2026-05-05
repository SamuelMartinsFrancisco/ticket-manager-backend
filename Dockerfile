# syntax = docker/dockerfile:1.14
# ---------------------------------------------------------------------
# Stage 1 – Build
# ---------------------------------------------------------------------
FROM node:24.14.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src/ src/
COPY drizzle/ drizzle/

RUN npm run build
RUN npx -y tsc-alias -p tsconfig.json
RUN npm prune --production

# ---------------------------------------------------------------------
# Stage 2 – Production
# ---------------------------------------------------------------------
FROM node:24.14.0-alpine

# The base image already has:
# - a 'node' user (UID 1000)
# - a 'node' group (GID 1000)
# This group can read Render's /etc/secrets as required.

WORKDIR /app

COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/drizzle ./drizzle

USER node

EXPOSE 8080
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]