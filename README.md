# KBU Hackathon 2026

The web platform for a single KBU hackathon event. It provides public event information, team registration and workspace, and organizer and administrator panels.

The application uses Next.js App Router, TypeScript, Prisma 7 with PostgreSQL, Better Auth, and Tailwind CSS v4. See [project status](docs/project-status.md) for implemented capabilities and remaining work.

## Routes

| Area | Routes | Access |
| --- | --- | --- |
| Public | `/`, `/announcements`, `/announcements/[announcementId]`, `/resources`, `/resources/[id]`, `/cards/[token]` | Public event information and shared participant cards |
| Account | `/register`, `/login`, `/reset-password`, `/student-email/verify` | Registration, sign-in, password reset, and email verification |
| Participant | `/team`, `/team/references`, `/team/submit`, `/team/settings`, `/team/notifications` | Approved team accounts |
| Management | `/panel`, `/panel/announcements`, `/panel/organizers`, `/panel/registrations`, `/panel/registrations/[id]`, `/panel/teams`, `/panel/teams/[teamId]`, `/panel/notifications`, `/panel/event`, `/panel/settings` | Organizers and administrators |
| Administrator | `/admin`, `/admin/audits`, `/admin/organizers`, `/admin/settings` | Administrators |
| API | `/api/auth/[...all]`, `/api/password-reset/request`, `/api/announcements`, `/api/admin/users`, `/api/participant/member-card/[memberId]/download`, `/api/upload/proxy`, `/api/upload/delete` | Authentication and supporting application endpoints |

## Getting started

Requirements: Node.js 22+, pnpm 10.27+, and Docker.

Copy `.env.example` to `.env` and configure the local environment. See the [development workflow](docs/development-workflow.md) for environment requirements and quality checks.

```bash
pnpm install
pnpm db:start
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| Topic | Guide |
| --- | --- |
| Architecture and code organization | [Architecture](docs/architecture.md) |
| Roles, authentication, and access control | [Authentication](docs/authentication.md) |
| Login, registration, and team accounts | [Login flow](docs/login-flow.md), [registration flow](docs/registration-flow.md), [team account lifecycle](docs/team-account-lifecycle.md) |
| Implemented features and follow-up work | [Project status](docs/project-status.md) |
| Local development, environment, and tests | [Development workflow](docs/development-workflow.md) |
| PostgreSQL, Prisma, and migrations | [Database](docs/database.md) |
| Uploads and Cloudflare R2 | [Storage](docs/storage.md) |
| Production containers and deployment | [Deployment](docs/deployment.md) |
| Branches and pull requests | [Git workflow](docs/git-workflow.md) |
