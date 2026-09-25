# KBU Hackathon 2026

KBU Hackathon 2026 is the web platform for a single KBU hackathon event. It provides public event information and the foundation for team, organizer, and administrator workspaces.

## Current foundation

The current foundation includes Better Auth authentication, Prisma persistence, protected workspace guards, shared contracts, server actions, data/services layers, response mappers, organizer and team management, account bans, audit records, centralized SMTP notification delivery, student email verification, event settings management, announcement management with published-announcement editing, and Cloudflare R2 file storage.

The system uses three account roles:

- **Team**: one shared username/password account for the team.
- **Organizer**: staff email/password account.
- **Admin**: elevated staff email/password account.

Team members are roster records. They do not receive Better Auth accounts; their `@ms.kbu.ac.th` addresses are used for notifications and single-use email verification links sent by organizers or admins.

## Routes

| Area | Routes | Status |
| --- | --- | --- |
| Public | `/`, `/events`, `/announcements`, `/resources`, `/about` | Available without authentication |
| Registration and login | `/register`, `/login`, `/login/participant`, `/login/management` | Public entry points; registration business flow is follow-up work |
| Participant | `/team`, `/team/references`, `/team/submit`, `/team/settings` | Protected workspace; `/team` includes per-member digital card generation and downloads |
| Shared cards | `/cards/[token]` | Public participant card page using a revocable share token |
| Management | `/panel`, `/panel/announcements`, `/panel/registrations`, `/panel/teams`, `/panel/teams/[teamId]`, `/panel/event`, `/panel/settings` | Organizer-protected workspace; team browsing/detail and event settings management are implemented |
| Administrator | `/admin`, `/admin/audits`, `/admin/organizers`, `/admin/settings` | Admin-protected workspace; organizer management is implemented, audit browsing/deletion are implemented, while settings remain pending |
| Auth protocol | `/api/auth/[...all]` | Better Auth handler; application mutations use server actions |

Unknown routes and invalid public detail records use the branded global 404 page at `app/not-found.tsx`.

## Architecture boundaries

The backend is organized as contracts ? actions/data ? services ? persistence:

- `lib/contracts`: Zod schemas and public input/output DTOs.
- `actions`: thin authenticated server actions that validate input and return `ActionResult` envelopes.
- `lib/data`: read-only queries, including offset-paginated lists.
- `lib/services`: business rules, Better Auth integration, transactions, email, and mutations.
- `lib/mappers`: pure conversion from Prisma/service records to contract-safe DTOs.

Pages and client components consume contracts only. Prisma models, Better Auth objects, sessions, and raw exceptions never cross the UI boundary. Dates crossing that boundary are ISO strings. Validation errors contain a generic message and field-specific `fieldErrors`.

## Implemented backend capabilities

- Create, list/read, update, ban, and unban organizer accounts.
- Browse approved teams with pagination, submission counts, roster/submission detail views, and team ban/unban actions.
- Admins can ban organizers and teams; organizers can ban teams only. Bans revoke active sessions and create audit records.
- Student email verification uses random hashed tokens, expiry, replacement of outstanding tokens, and atomic single-use consumption.
- SMTP delivery is provider-neutral through `sendEmail`; named notification templates route password resets, student verification, account ban/unban, and organizer account-created messages through `sendNotification`. SMTP delivery is awaited, while `AuditLog` delivery outcomes are recorded asynchronously and do not change the delivery result. Onboarding password-setup links are single-use and valid for seven days; ordinary password-reset links remain valid for one hour.
- Event settings are managed through authenticated organizer/admin server actions with Zod validation, ISO-safe DTO mapping, atomic singleton upserts, and audit logging.
- File storage uses authenticated server-side proxy uploads to Cloudflare R2. Approved teams can upload team images/submissions under `uploads/<team-id>/`; organizers/admins can upload event images under `uploads/events/`. Uploads are validated by the proxy and returned as public R2 URLs.
- The active Prisma schema models the single event, teams, team members, registrations, submissions, accounts, sessions, bans, audits, and verification tokens.

Participant registration, broader organizer operational workflows, and general account-management UI are intentionally deferred. Admins can browse and permanently delete audit records individually. The audit browser provides a manually opened, paginated user/team-member picker through `/api/admin/users`.

## Getting started

Requirements: Node.js 22+, pnpm 10.27+, and Docker.

```bash
pnpm install
pnpm db:start          # start local postgres via docker-compose.local.yml
pnpm db:migrate        # apply migrations
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env` and fill in the variables for your environment.

Required for local development:

- Application: `PORT`, `NODE_ENV`, and `NEXT_PUBLIC_APP_URL`.
- Authentication: `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.
- Database: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `DATABASE_URL`.

Optional feature-specific settings:

- SMTP email delivery: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL`.
- Sentry error monitoring: `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN`.
- Cloudflare Turnstile: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
- Cloudflare R2 storage: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `NEXT_PUBLIC_R2_PUBLIC_URL`.
- Upstash Redis rate limiting: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (optional locally, required in production).

Production startup requires the SMTP, Cloudflare R2, and Upstash Redis settings in addition to the local-development settings, and stops when required values are missing or invalid. Redis-backed limits are shared across application instances; local development falls back to in-memory Better Auth limits and disables the application-specific Redis limits. Sentry DSNs are public project identifiers; set `NEXT_PUBLIC_SENTRY_DSN` at build time so browser bundles receive it.

## File storage

Uploads use authenticated API requests:

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `POST /api/upload/proxy` | Approved team or organizer/admin | Validate and upload the multipart file to R2. |
| `POST /api/upload/delete` | Owner of the upload scope | Delete an object from R2. |

Use `category: "image"` or `"submission"` for team uploads and `category: "event-image"` for management event images. The browser sends the file to the authenticated proxy; the returned URL must then be saved in the relevant team or `EventSettings.imageUrls` record. Deleting an R2 object does not remove its URL from the database automatically.

## Prisma workflow

```bash
pnpm db:start          # start local postgres
pnpm db:watch          # start postgres with logs
pnpm db:stop           # stop postgres
pnpm db:down           # stop and remove postgres + volume
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma format --schema prisma/schema.prisma
pnpm exec prisma generate
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:push
pnpm db:seed
```

Migration, push, and seed commands mutate database state. The development seed clears existing development data and recreates fixtures; never point it at production.

## Quality checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Production Docker deployment

The image uses Node.js 24 LTS, pnpm 10.27.0, and Next.js standalone output. Docker Compose is configured for a Linux production host with Docker Compose 2.24.0 or later. Both services require `/opt/hackathon/.env.production`; local `.env` and `.env.local` files are not loaded into the containers.

Create that file on the host with restricted permissions and the required database values:

```dotenv
POSTGRES_DB=kbu_hackathon
POSTGRES_USER=kbu_hackathon
POSTGRES_PASSWORD=<set-a-unique-production-password>
NEXT_PUBLIC_SENTRY_DSN=<public-sentry-project-dsn>
SENTRY_AUTH_TOKEN=
```

Replace the password placeholder before deployment. For browser error reporting, replace `NEXT_PUBLIC_SENTRY_DSN` with the public project DSN; leave it empty to disable Sentry reporting. Compose passes it to the image build. Set `SENTRY_AUTH_TOKEN` to a Sentry auth token if you want source maps uploaded during the image build; leave it empty otherwise. Compose mounts it only for that build step and clears it from the running containers. The database receives its values directly from the file. Existing PostgreSQL volumes retain their original credentials; changing this file does not rotate an existing database password.

From the repository directory on the production host:

The deployment workflow validates `/opt/hackathon/.env.production` for all required nonblank variables before tagging images, pulling code, building, or starting containers. A missing file or value stops deployment without changing the running release.

```bash
docker compose --env-file /opt/hackathon/.env.production config --quiet
docker compose --env-file /opt/hackathon/.env.production build web
docker compose --env-file /opt/hackathon/.env.production up -d
docker compose --env-file /opt/hackathon/.env.production ps
docker compose --env-file /opt/hackathon/.env.production exec web id -u
docker compose --env-file /opt/hackathon/.env.production exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
curl --fail http://127.0.0.1:3000/
```

Expect UID `1001`, a healthy database, and a successful HTTP response. Verify a `/_next/static/` asset referenced by the returned HTML also responds successfully. The web port is bound to localhost for a host reverse proxy; PostgreSQL has no published port. A missing production environment file fails Compose validation. Use `config --quiet` to avoid printing credentials. Validate fresh database startup with a separate test volume; never remove the production `postgres_data` volume as part of testing.

The deployment workflow performs only lightweight dangling-image cleanup after the health check. BuildKit cache cleanup is intentionally excluded from the deployment path because it can exceed the remote command timeout. Run it separately during maintenance after checking available disk space, for example with `docker builder prune -f --filter "until=168h"`.

Environment files are excluded from image builds. `NEXT_PUBLIC_SENTRY_DSN` and other `NEXT_PUBLIC_*` settings must be supplied at build time; runtime environment injection cannot change values already bundled into browser assets.

## Branching

Before starting a change, create or claim its GitHub issue, assign yourself, and leave a `Working on this` comment so the work is visible to the team. Create a focused branch from `dev` for the issue, then open its pull request into `dev`. Promote tested changes from `dev` to `main` through a separate pull request.

Name feature branches by work type and a short, lowercase description:

```text
feat/event-registration
fix/mobile-navigation
docs/project-guide
chore/update-dependencies
```

## Pull requests

Open a pull request from the focused branch into `dev` and link its GitHub issue. Use a clear title such as `feat: add team settings page` or `fix: keep sidebar navigation visible on mobile`. When the integrated work is ready for release, open a separate `dev` to `main` pull request.

The `Validate main pull request source` workflow (`.github/workflows/main-source-branch.yml`) rejects a `main` pull request unless its source branch is `dev`. The `Continuous Integration` workflow (`.github/workflows/ci.yml`) validates code quality (Biome lint, TypeScript typecheck, Next.js build) on pull requests to `dev` and `main`.

When a release pull request is merged into `main`, the `Secure Production Deployment` workflow (`.github/workflows/deploy.yml`) triggers an automated, zero-trust deployment to `/opt/hackathon` on the production host via SSH using the restricted `kbu-deploy` service account.

### Merge strategy

- Use **Squash and merge** for focused feature, fix, documentation, and maintenance pull requests into `dev`. This keeps one clear commit for each issue.
- Use **Create a merge commit** for `dev` to `main` release pull requests. This preserves `dev` as an ancestor of `main` and prevents future release pull requests from repeating earlier commits.

Use this description format:

```md
## Summary
- What changed and why.

## Validation
- [ ] pnpm lint
- [ ] pnpm exec tsc --noEmit
- [ ] pnpm build

## Screenshots
<!-- Optional: include when helpful to review visible UI changes. -->

Closes #<issue-number>
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Serve a completed production build. |
| `pnpm lint` | Check formatting and lint rules with Biome. |
| `pnpm lint:fix` | Apply Biome lint and formatting fixes. |
| `pnpm format` | Format files with Biome. |
| `pnpm exec tsc --noEmit` | Run TypeScript checking. |
| `pnpm db:start` | Start local postgres via docker-compose.local.yml. |
| `pnpm db:watch` | Start postgres in foreground with logs. |
| `pnpm db:stop` | Stop postgres container. |
| `pnpm db:down` | Stop and remove postgres container + volume. |

## Tooling

- **Next.js App Router** with TypeScript and the `@/*` import alias.
- **Prisma 7** with PostgreSQL and the `@prisma/adapter-pg` driver adapter.
- **Better Auth** for sessions and credentials.
- **Tailwind CSS v4** with the full default palette. Orange is the semantic primary color, so utilities such as `bg-orange-600` and `text-orange-500` are available alongside semantic theme classes.
- **shadcn/ui** using the Base UI, Nova, neutral-base configuration and **Lucide** icons.
- **Biome** for linting and formatting, with Husky and lint-staged running checks before commits.

The shadcn-generated files in `components/ui` are intentionally excluded from Biome checks. Add application-specific composition and styling in other `components` files instead.

Browse the [shadcn component catalog](https://ui.shadcn.com/docs/components) before adding a primitive:

```bash
pnpm dlx shadcn@latest add <component>
```

## Keeping documentation current

Update this README and `AGENTS.md` whenever a feature, route, workflow, command, dependency, or external documentation link is added, removed, or materially changed. Update `lib/navigation.ts` with the same change when it affects a navigable route.

## Unit testing

Run the non-UI unit-test suite with Node's built-in test runner:

    pnpm test:unit
    pnpm test:unit:watch

Unit tests live under tests/unit and use helpers from tests/helpers. External boundaries are mocked; database integration tests are separate workflows.
