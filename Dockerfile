# syntax=docker/dockerfile:1

# ---- build: install full deps (vite/tsc are devDependencies) and emit the static bundle ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# Vite inlines import.meta.env.VITE_* into the bundle at build time — unlike
# the backend, this can't be supplied as a runtime container env var. Must be
# passed as a build arg (see docker-compose.yml).
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---- runtime: static files only, served by nginx — no Node/node_modules needed ----
FROM docker.io/nginxinc/nginx-unprivileged:1.30-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD wget -qO- http://127.0.0.1:8080/ || exit 1
