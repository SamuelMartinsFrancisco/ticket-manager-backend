# syntax = docker/dockerfile:1.2
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
RUN npm prune --omit=dev

# ---------------------------------------------------------------------
# Stage 2 – Production
# ---------------------------------------------------------------------
FROM node:24.14.0-alpine

# Install the shadow package to get usermod
RUN apk add --no-cache shadow

# Add the node user to the 1000 group (Render’s secret-reader group)
RUN usermod -a -G 1000 node

WORKDIR /app

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/drizzle ./drizzle

USER node

EXPOSE 8080
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]