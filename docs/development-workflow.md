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

## End-to-end tests (Playwright)

E2E tests drive a real browser against a real database via server actions. They are not run in CI.

### Prerequisites

1. A dedicated test database (e.g. a separate Neon database) — the seed is destructive.
2. `.env.e2e` — copy `.env.e2e.example` and fill in your test `DATABASE_URL`. Other vars (SMTP, R2) can be dummy values; Upstash is left blank so rate limits fall back to in-memory.
3. Chromium installed: `npx playwright install chromium`

### Running

```bash
# Full suite: seeds the test DB, starts next dev, runs all specs, kills server
pnpm test:e2e

# Watch mode (server stays up between runs)
pnpm test:e2e:watch

# Visible browser
pnpm test:e2e:headed

# Skip re-seeding (if DB is already seeded)
E2E_SKIP_SEED=1 pnpm test:e2e
```

`tests/e2e/global-setup.ts` loads `.env.e2e` into `process.env` (which the Playwright `webServer` inherits) and runs `pnpm db:seed` before the suite.

### Spec files

| File | Coverage |
|---|---|
| `auth.spec.ts` | Session API, login form basics |
| `protected.spec.ts` | Unauthenticated redirects for `/team`, `/panel`, `/admin` |
| `announcements.spec.ts` | `GET /api/announcements` JSON envelope |
| `authenticated.spec.ts` | Team/organizer/admin login flows, sign out |
| `registration.spec.ts` | `submitTeamRegistration` — render, validation, success, duplicate email |
| `participant.spec.ts` | `saveSubmission`, `changeTeamPassword`, notification actions |
| `panel-announcements.spec.ts` | Announcement CRUD lifecycle (create/publish/archive/delete/update) |
| `panel-manage.spec.ts` | 14 organizer actions: event settings, registrations, teams, notifications, profile |
| `admin.spec.ts` | Admin actions: organizer CRUD, ban/unban, profile, password, audit delete |

### Not covered

- **7 actions with no UI** (no page calls them) — unit-test territory
- **R2-dependent actions** (`updateTeamLogo`, `updateMemberImage`, `generateMemberCard`) — need Cloudflare storage
- **`verifyTeamMemberEmail`** — single-use token consumed on page load

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
