# ── Stage 1: build + dependencias ─────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Herramientas para compilar módulos nativos (bcrypt requiere Python + make + g++)
RUN apk add --no-cache python3 make g++

# Instalar TODAS las dependencias (incluye devDependencies para nest build)
COPY package*.json ./
RUN npm ci

# Copiar fuente y compilar TypeScript con NestJS CLI
COPY . .
RUN npm run build

# Eliminar devDependencies del directorio node_modules
# (el resultado queda listo para copiarse a producción)
RUN npm prune --omit=dev

# ── Stage 2: imagen de producción ─────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Copiar node_modules ya compilados y sin devDeps desde el builder
# → los binarios nativos (bcrypt) ya están compilados, no hace falta recompilar
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Railway asigna el puerto dinámicamente vía $PORT
# NestJS lo lee con: process.env.PORT ?? 3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
