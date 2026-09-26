# KBU Hackathon 2026 contributor guide

## Architecture

KBU Hackathon 2026 is a Next.js App Router application for a single KBU hackathon event. Route groups organize the workspaces without changing their URLs:

- `app/(public)` contains public discovery, registration, and login pages. `/login` is the single login route and switches between participant and management access with tabs.
- `app/(participant)/team` is the approved team workspace.
- `app/(management)/panel` is the organizer workspace.
- `app/(admin)/admin` is the elevated administrator workspace.
- `app/api/auth/[...all]/route.ts` is the Better Auth protocol endpoint.

Keep page-specific interactive components in a private `_components` directory beside the page. Put components shared by multiple routes in `components/`. `components/ui` contains shadcn-generated source and must not be hand-edited; add components with `pnpm dlx shadcn@latest add <component>`.

Prefer Server Components. Use client components only for browser state, events, forms, mutations, or client-only libraries. Keep navigable public, participant, and management destinations in `lib/navigation.ts`.

## Components and navigation

- Prefer Server Components. Add `"use client"` only when a component needs browser state, events, effects, or a client-only library.
- Keep page files server-rendered where possible; place interactive behavior in focused client components.
- Maintain public, participant, and management link definitions in `lib/navigation.ts`. Update that file whenever a navigation destination changes.
- Update `README.md` and this file whenever a feature, route, workflow, command, dependency, or external documentation link is added, removed, or materially changed. Keep the README route map aligned with the application and `lib/navigation.ts` aligned with navigable routes.
- Reuse application components from `components`. Do not place app-specific UI in `components/ui`.
- `components/ui` is shadcn-generated source. Do not hand-edit it. This project uses shadcn's Base UI configuration; browse the [component catalog](https://ui.shadcn.com/docs/components) and add a component with `pnpm dlx shadcn@latest add <component>`.

## Styling

- Use Tailwind CSS v4 utilities and the semantic CSS variables defined in `app/globals.css`.
- Orange is the product primary color. Use the existing semantic primary utilities or Tailwind orange utilities such as `bg-orange-600`, `text-orange-500`, and `bg-orange-900` when appropriate.
- Preserve the full default Tailwind color palette and the existing shadcn CSS-variable theme.
- Use Lucide icons through `lucide-react`.

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
- Public announcement and participant-card sharing with mobile native share and desktop copy-link/LINE actions.
- Organizer/admin event settings reads and upserts with Zod validation, ISO-string DTO mapping, atomic persistence, and audit logging.
- Cloudflare R2 storage with server-side proxy uploads, team-owned `uploads/<team-id>/` keys, organizer/admin-owned `uploads/events/` keys, and admin-owned `uploads/admins/<admin-id>/` keys.
- Provider-neutral SMTP delivery through `sendEmail`, with typed notification templates and `sendNotification` for Better Auth password resets, student verification, account ban/unban, and organizer account-created messages. SMTP delivery is awaited; delivery outcomes are recorded asynchronously in `AuditLog` and never change the SMTP result. Organizer/team onboarding links are single-use and valid for seven days; ordinary password-reset links remain valid for one hour.
- Prisma data models for the single event, teams, roster members, registrations, submissions, sessions, bans, audits, and verification tokens.
- Organizer/admin team management at `/panel/teams` provides paginated approved-team browsing, submission counts, team detail views, and team ban/unban actions; submissions are shown on the team detail page.

Participant registration workflows, broader organizer management workflows, and broader account-management UI remain follow-up work. Announcement management supports editing both draft and published announcements; published announcements can also be archived. Admins can browse and permanently delete audit records individually; deletion does not create a replacement audit record. The admin audit browser loads user/team-member filter options manually through the paginated `/api/admin/users` route, defaulting to 200 records per request. Admin profile settings update name, email, password, and profile image; admin profile uploads use `uploads/admins/<admin-id>/`.

## Database and email workflow

Prisma 7 uses `prisma7.config.ts`, PostgreSQL, the generated client in `generated/prisma`, and the `@prisma/adapter-pg` driver adapter. The active schema is `prisma/schema.prisma`; files under `docs/` are design references unless explicitly applied through migrations.

Local development uses `docker-compose.local.yml` to run a postgres container on `localhost:5432`. The production `docker-compose.yml` is a full-stack spec with internal networking and no host port mapping. The `db:start`/`db:watch`/`db:stop`/`db:down` scripts reference the local file explicitly via `-f docker-compose.local.yml`.

Common commands:

```bash
pnpm install
pnpm dev
pnpm db:start          # start local postgres via docker-compose.local.yml
pnpm db:watch          # start postgres in foreground (logs visible)
pnpm db:stop           # stop postgres container
pnpm db:down           # stop and remove postgres container + volume
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate
pnpm exec prisma format --schema prisma/schema.prisma
pnpm db:seed
pnpm db:migrate
pnpm db:migrate:deploy
pnpm db:push
```

`db:migrate`, `db:migrate:deploy`, `db:push`, and `db:seed` mutate database state. Confirm the target database before running them. The development seed resets data and recreates fixture accounts, so it must never run against production.

Required environment categories are `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SMTP_*` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`), and Cloudflare R2 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`). Production Node.js startup validates these values and stops when any are missing or invalid; build-time validation is skipped. Sentry reporting uses `NEXT_PUBLIC_SENTRY_DSN`; it is a public project identifier and must be set at build time for browser bundles. Node.js instrumentation emits one info event per server instance startup. Keep provider names out of application configuration.

## File storage workflow

Uploads use `app/api/upload/proxy` and `app/api/upload/delete`. The browser sends the file as `multipart/form-data` to the proxy route, which validates the session, file type, and size, then streams the object to R2. Team categories (`image`, `submission`, `member-profile-image`) require an approved team session and use `uploads/<team-id>/`; `event-image` requires an organizer/admin session and uses `uploads/events/`; `admin-profile-image` requires an admin session and uses `uploads/admins/<admin-id>/`. Services must enforce key ownership and never trust a client-provided URL or key outside the authorized prefix. Event image URLs are saved separately through event settings; storage deletion does not update database URL arrays.

## Quality checks

Run the relevant checks before finishing a change:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Biome intentionally excludes `components/ui`. Do not use a whole-project formatter command to modify those generated files. Husky runs lint-staged before commits.

## Production containers

- Use Node.js 24 LTS for Docker builds and runtime, with `gcompat` in the shared base. Keep pnpm 10.27.0 in build stages only.
- Preserve standalone output, UID 1001 execution, the localhost web binding, and the private database network.
- Both Compose services require `/opt/hackathon/.env.production`. Do not introduce local environment file fallbacks or interpolated database credential defaults.
- `NEXT_PUBLIC_SENTRY_DSN` is passed to the production image build. `SENTRY_AUTH_TOKEN` is mounted as a BuildKit secret for source-map uploads and must remain unavailable to runtime containers.
- Deployment requires nonempty `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values. Health checks must expand these inside the container using escaped Compose dollar signs.
- Validate with `docker compose --env-file /opt/hackathon/.env.production config --quiet`, `docker compose --env-file /opt/hackathon/.env.production build web`, and `docker compose --env-file /opt/hackathon/.env.production up -d` on the configured host. Check database readiness, HTTP and static asset responses, and `docker compose exec web id -u` (expected `1001`). See README for the full commands.
- Use an isolated test volume for database startup validation. Preserve production volumes; environment changes do not rotate existing database credentials.
- The deployment workflow preflights `/opt/hackathon/.env.production` before image tagging, code updates, builds, or container startup; missing or blank required values must stop deployment without changing the running release.

## Git branches

- Before beginning implementation, create or claim the relevant GitHub issue, assign yourself, and add a `Working on this` comment.
- Create each focused branch from `dev`. Open its pull request into `dev`; do not merge feature branches directly into `main`.
- Promote tested integrated work from `dev` to `main` through a separate release pull request.
- `.github/workflows/main-source-branch.yml` validates that `main` pull requests originate from `dev`. Keep its `Require dev source branch` job configured as a required `main` branch status check after the workflow has run.
- `.github/workflows/ci.yml` validates code quality (Biome lint, TypeScript typecheck, Next.js build) on PRs to `dev` and `main`.
- `.github/workflows/deploy.yml` triggers automated remote deployment to `/opt/hackathon` on the Debian 13 production host upon push to `main` using the least-privilege `kbu-deploy` service account.
- Use `<type>/<short-description>` in lowercase kebab case, such as `feat/team-settings`, `fix/sidebar-toggle`, `docs/readme`, or `chore/update-dependencies`.
- Keep a branch limited to one coherent change and run the relevant quality checks before handing it off.

## Pull requests

- Open a pull request from the focused branch into `dev` and link the corresponding GitHub issue with `Closes #<issue-number>`. Use a separate `dev` to `main` pull request for a release.
- Use a concise conventional title, for example `feat: add team settings page` or `fix: correct mobile navigation`.
- Use **Squash and merge** for focused pull requests into `dev`; this keeps one commit per issue.
- Use **Create a merge commit** for `dev` to `main` release pull requests. Do not squash this promotion because `dev` must remain an ancestor of `main`.
- Use this body format:

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
