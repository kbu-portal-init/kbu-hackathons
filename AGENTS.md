# KBU Hub contributor guide

## Architecture

KBU Hub is a Next.js App Router application for a single KBU hackathon event. Route groups organize the workspaces without changing their URLs:

- `app/(public)` contains public discovery, registration, and login pages.
- `app/(participant)/teams` is the approved team workspace.
- `app/(management)/panel` is the organizer workspace.
- `app/(admin)/admin` is the elevated administrator workspace.
- `app/api/auth/[...all]/route.ts` is the Better Auth protocol endpoint.

Keep page-specific interactive components in a private `_components` directory beside the page. Put components shared by multiple routes in `components/`. `components/ui` contains shadcn-generated source and must not be hand-edited; add components with `pnpm dlx shadcn@latest add <component>`.

Prefer Server Components. Use client components only for browser state, events, forms, mutations, or client-only libraries. Keep navigable public, participant, and management destinations in `lib/navigation.ts`.

## Authentication and roles

Better Auth is configured in `lib/auth/config.ts` with the Prisma adapter, email/password authentication, username support, and admin capabilities. The supported `User.role` values are:

- `team`: one shared username/password account per team.
- `organizer`: staff account using email/password.
- `admin`: elevated staff account using email/password.

Team members are roster records, not Better Auth users. Their `studentEmail` is used for notifications and organizer-triggered verification. Student verification stores hashed, expiring, single-use tokens and sets `studentEmailVerifiedAt`.

`lib/auth/guards.ts` is the access-control boundary. It checks sessions, active bans, roles, and approved team registration status. Banned accounts are denied while a ban is active; an expired ban no longer blocks access. Keep authorization in guards and services, never only in UI code.

## Backend boundaries

Keep dependencies flowing inward:

1. `lib/contracts` contains dependency-light Zod schemas and UI-safe input/output types.
2. `lib/data` contains read-only database queries and pagination.
3. `lib/services` contains business rules, Better Auth calls, mutations, email, and transactions.
4. `lib/mappers` converts persistence/service records into contract DTOs.
5. `actions` are thin server actions: authenticate, validate `unknown` input, delegate, and return typed envelopes.

Prisma models, Better Auth responses, sessions, and exceptions must not cross into pages or client components. Date values at the UI boundary are ISO strings.

Shared responses use `ActionResult<T>`, `ListActionResult<T>`, `ListResult<T>`, and `PaginationMeta`. Validation failures use a generic message plus reusable `fieldErrors`. Lists currently use offset pagination (`page`, `pageSize`, `total`, `hasNextPage`); do not expose Prisma pagination objects.

## Implemented foundation

The branch currently provides:

- Admin-protected organizer create, list/read, update, ban, and unban workflows.
- Admin and organizer account-ban permissions: admins may target organizers and teams; organizers may target teams only. Bans revoke sessions and write audit records.
- Organizer/admin-triggered student email verification.
- Provider-neutral SMTP delivery through `sendEmail`, including Better Auth password-reset delivery.
- Prisma data models for the single event, teams, roster members, registrations, submissions, sessions, bans, audits, and verification tokens.

Participant registration workflows, organizer management workflows beyond the foundation, audit browsing, and broader account-management UI remain follow-up work.

## Database and email workflow

Prisma 7 uses `prisma7.config.ts`, PostgreSQL, the generated client in `generated/prisma`, and the `@prisma/adapter-pg` driver adapter. The active schema is `prisma/schema.prisma`; files under `docs/` are design references unless explicitly applied through migrations.

Common commands:

```bash
pnpm install
pnpm dev
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate
pnpm exec prisma format --schema prisma/schema.prisma
pnpm db:seed
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:push
```

`db:migrate`, `db:migrate:deploy`, `db:push`, and `db:seed` mutate database state. Confirm the target database before running them. The development seed resets data and recreates fixture accounts, so it must never run against production.

Required environment categories are `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `SMTP_*` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`). Keep provider names out of application configuration.

## Quality and contribution workflow

Run the relevant checks before handoff:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Create focused branches from `dev` using lowercase `<type>/<short-description>` names, open pull requests into `dev`, and promote tested `dev` to `main` with a separate release pull request. Keep each branch coherent. Update this file and `README.md` whenever routes, commands, dependencies, workflows, or architecture change.

Use squash merges for focused pull requests into `dev` and merge commits for `dev` to `main`. Do not add application-specific UI to `components/ui`, bypass service-layer authorization, or return raw persistence objects from actions.
