# Crephore Web

Nuxt app for Crephore. Conventions are in [CLAUDE.md](CLAUDE.md).

## API

The app talks to `../crephore-backend`. Copy `.env.example` to `.env` and start the API first (it serves `http://localhost:5180`):

```bash
cp .env.example .env
```

Auth uses HttpOnly cookies set by the API, so use Chrome or Firefox in local development. Safari does not keep `Secure` cookies on `http://localhost`.

## Tests

```bash
npm test
npm run typecheck
```

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
