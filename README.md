# KBU Hub

KBU Hub is the web platform for discovering KBU hackathons, reading announcements, and finding resources for students. It also provides the starting point for participant and management workspaces.

## Current status

The project currently provides a responsive UI shell and placeholder dashboard pages. Authentication, team-registration approval checks, data storage, and form submissions have not been implemented yet.

Public pages are available to everyone. The `/teams` participant workspace, `/panel` management workspace, and `/admin` administrator workspace are visual placeholders until access control is designed.

## Routes

| Area | Routes | Purpose |
| --- | --- | --- |
| Public | `/`, `/events`, `/announcements`, `/resources`, `/about` | Discover hackathons, community updates, and student resources. |
| Registration | `/register` | Explain the future team registration and approval process. |
| Login | `/login`, `/login/participant`, `/login/management` | Choose an access type and view the corresponding dummy login form. |
| Participant dashboard | `/teams`, `/teams/references`, `/teams/members`, `/teams/submit`, `/teams/settings` | Future approved-team workspace. |
| Management dashboard | `/panel`, `/panel/announcements`, `/panel/registrations`, `/panel/teams`, `/panel/event`, `/panel/settings` | Future organizer workspace. |
| Administrator dashboard | `/admin`, `/admin/audits`, `/admin/organizers`, `/admin/settings` | Future elevated management workspace. |

## Getting started

### Requirements

- Node.js 22 or later
- pnpm 10.27.0

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Docker deployment

The image uses Node.js 24 LTS, pnpm 10.27.0, and Next.js standalone output. Docker
Compose is configured for a Linux production host with Docker Compose 2.24.0 or
later. Both services require `/opt/hackathon/.env.production`; local `.env` and
`.env.local` files are not loaded into the containers.

Create that file on the host with restricted permissions and these nonempty values:

```dotenv
POSTGRES_DB=kbu_hackathon
POSTGRES_USER=kbu_hackathon
POSTGRES_PASSWORD=<set-a-unique-production-password>
```

Replace the password placeholder before deployment. The database receives these
values directly from the file. Existing PostgreSQL volumes retain their original
credentials; changing this file does not rotate an existing database password.
The application currently has no database or authentication integration. When
adding it, use `db:5432` as the database address from the web container.

From the repository directory on the production host:

```bash
docker compose config --quiet
docker compose build web
docker compose up -d
docker compose ps
docker compose exec web id -u
docker compose exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
curl --fail http://127.0.0.1:3000/
```

Expect UID `1001`, a healthy database, and a successful HTTP response. Verify a
`/_next/static/` asset referenced by the returned HTML also responds successfully.
The web port is bound to localhost for a host reverse proxy; PostgreSQL has no
published port. A missing production environment file fails Compose validation.
Use `config --quiet` to avoid printing credentials. Validate fresh database startup
with a separate test volume; never remove the production `postgres_data` volume
as part of testing.

Environment files are excluded from image builds. Future `NEXT_PUBLIC_*` settings
must be supplied at build time; runtime environment injection cannot change values
already bundled into browser assets.

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

## Tooling

- **Next.js App Router** with TypeScript and the `@/*` import alias.
- **Tailwind CSS v4** with the full default palette. Orange is the semantic primary color, so utilities such as `bg-orange-600` and `text-orange-500` are available alongside semantic theme classes.
- **shadcn/ui** using the Base UI, Nova, neutral-base configuration and **Lucide** icons.
- **Biome** for linting and formatting, with Husky and lint-staged running checks before commits.

The shadcn-generated files in `components/ui` are intentionally excluded from Biome checks. Add application-specific composition and styling in other `components` files instead.

## Keeping documentation current

Update this README and `AGENTS.md` whenever a feature, route, workflow, command, dependency, or external documentation link is added, removed, or materially changed. Update `lib/navigation.ts` with the same change when it affects a navigable route.

### Adding shadcn components

This project uses shadcn’s Base UI configuration. Browse the available components in the [shadcn component catalog](https://ui.shadcn.com/docs/components), then add one with pnpm:

```bash
pnpm dlx shadcn@latest add <component>
```
