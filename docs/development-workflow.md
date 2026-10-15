# Local development and quality checks

Requirements: Node.js 22+, pnpm 10.27+, and Docker for the local database.

## Setup

Copy `.env.example` to `.env` and configure the local database and authentication values before running the setup commands.

```bash
pnpm install
pnpm db:start
pnpm db:migrate
pnpm dev
```

Database startup, Prisma validation/generation/format, migration, and seed commands are documented in `docs/database.md`. Copy `.env.example` to `.env` and configure the local database and authentication values before starting the app.

## Quality checks

Run the relevant checks before finishing a change:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

For the focused unit and environment suites, run:

```bash
pnpm test:unit
pnpm test:announcements
```

Biome intentionally excludes `components/ui`. Do not use a whole-project formatter command to modify those generated files. Husky runs lint-staged before commits.

## Commands that mutate database state

`db:migrate`, `db:migrate:deploy`, `db:push`, and `db:seed` mutate database state. Confirm the target database before running them. The development seed resets data and recreates fixture accounts, so it must never run against production.

## Environment variables

Local development requires `PORT`, `NODE_ENV`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and PostgreSQL settings (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `DATABASE_URL`).

Production additionally requires SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`), Cloudflare R2 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`), and `LINE_CONTACT_URL` / `LINE_CONTACT_NAME`. Production Node.js startup validates required values and stops if any are missing or invalid; build-time validation is skipped.

Cloudflare Turnstile uses `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Upstash rate limiting uses `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; these are optional locally, where application-specific Redis limits are disabled and Better Auth uses in-memory limits, but required in production. `NEXT_PUBLIC_SENTRY_DSN` and `NEXT_PUBLIC_GA_ID` are optional public identifiers that must be supplied at build time to appear in browser assets. `SENTRY_AUTH_TOKEN` is an optional build secret used for source-map uploads. Node.js instrumentation emits one info event per server instance startup. Keep provider names out of application configuration.

## Pull request previews

The `Vercel Preview` workflow deploys pull requests targeting `dev` with the Vercel CLI. Configure these GitHub Actions repository secrets before opening or updating a pull request:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow smoke-tests the deployed URL and fails the PR check when the Preview cannot be reached or returns an HTTP error. It also creates or updates a Preview URL comment on the pull request. Branch push deployments remain restricted by `vercel.json` to `main`, `dev`, and `wip`.
