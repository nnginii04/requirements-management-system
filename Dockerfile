# ── build ──────────────────────────────────────────────────────────────
# 프론트(dist/)와 Prisma 클라이언트(generated/prisma)를 만듭니다.
FROM node:22-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── runtime ────────────────────────────────────────────────────────────
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 서버 소스는 tsx 로 직접 실행하므로 TS 그대로 복사합니다.
COPY prisma.config.ts tsconfig.json tsconfig.server.json ./
COPY prisma ./prisma
COPY server ./server
COPY src/types ./src/types
COPY src/utils ./src/utils
COPY src/mocks ./src/mocks

# 빌드 산출물
COPY --from=build /app/generated ./generated
COPY --from=build /app/dist ./dist

EXPOSE 3001
# start = prisma migrate deploy && tsx server/index.ts
CMD ["npm", "run", "start"]
