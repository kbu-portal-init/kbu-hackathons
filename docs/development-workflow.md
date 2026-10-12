# Local development and quality checks

Requirements: Node.js, pnpm, and Docker for the local database.

## Setup

```bash
pnpm install
pnpm dev
```

Database startup, Prisma validation/generation/format, migration, and seed commands are documented in `docs/database.md`.

## Quality checks

Run the relevant checks before finishing a change:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Biome intentionally excludes `components/ui`. Do not use a whole-project formatter command to modify those generated files. Husky runs lint-staged before commits.

## Commands that mutate database state

`db:migrate`, `db:migrate:deploy`, `db:push`, and `db:seed` mutate database state. Confirm the target database before running them. The development seed resets data and recreates fixture accounts, so it must never run against production.

## Environment variables

Required environment categories are `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SMTP_*` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`), and Cloudflare R2 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`). Production Node.js startup validates these values and stops when any are missing or invalid; build-time validation is skipped. Sentry reporting uses `NEXT_PUBLIC_SENTRY_DSN`; it is a public project identifier and must be set at build time for browser bundles. Node.js instrumentation emits one info event per server instance startup. Keep provider names out of application configuration.

Production also requires `LINE_CONTACT_URL` and `LINE_CONTACT_NAME`; these values are shared by the public support link and outgoing email footers.

## Pull request previews

The `Vercel Preview` workflow deploys pull requests targeting `dev` with the Vercel CLI. Configure these GitHub Actions repository secrets before opening or updating a pull request:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow creates or updates a Preview URL comment on the pull request. Branch push deployments remain restricted by `vercel.json` to `main`, `dev`, and `wip`.

See `README.md` for the full `.env.example`-based setup, including optional Turnstile and Upstash Redis settings.
