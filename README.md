# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 5ml isolated runtime fix (2026-09-01)

- The CSP for `/__isolated/5ml-test/**` allows `https://unpkg.com` only for scripts because the exported DC runtime loads pinned React/ReactDOM 18.3.1 UMD files with SRI.
- Dynamic YouTube iframe bindings use `sc-camel-src` instead of raw `src="{{ ... }}"`, so the browser does not request encoded template placeholders before the DC runtime mounts.
- `frame-src` remains restricted to `https://www.youtube-nocookie.com`.
