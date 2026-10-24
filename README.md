# Crephore Web

Nuxt app for Crephore. Conventions are in [CLAUDE.md](CLAUDE.md).

## Prerequisites

- Node.js
- pnpm (the version is pinned in `package.json` under `packageManager`; with Corepack enabled, `corepack enable` picks it up)

## API

The app talks to `../crephore-backend`. Copy `.env.example` to `.env` and start the API first (it serves `http://localhost:5180`):

```bash
cp .env.example .env
```

Auth uses HttpOnly cookies set by the API, so use Chrome or Firefox in local development. Safari does not keep `Secure` cookies on `http://localhost`.

## Setup

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Tests

```bash
pnpm test
pnpm typecheck
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview the production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
