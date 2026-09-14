FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable \
 && corepack prepare pnpm@10.15.0 --activate \
 && pnpm --version

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts=false

COPY . .

ARG NUXT_PUBLIC_API_BASE
ARG NUXT_PUBLIC_TEST_API_BASE
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE \
    NUXT_PUBLIC_TEST_API_BASE=$NUXT_PUBLIC_TEST_API_BASE

RUN pnpm build:optimized

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NITRO_PORT=3003 \
    NITRO_HOST=0.0.0.0

COPY --from=build /app/.output ./.output

COPY --from=build /app/content ./content

EXPOSE 3003

USER node

CMD ["node", ".output/server/index.mjs"]
