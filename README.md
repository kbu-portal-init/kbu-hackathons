# KBU Hub

KBU Hub is the web platform for a single KBU hackathon event. It provides public event information and the foundation for team, organizer, and administrator workspaces.

## Current foundation

The current foundation includes Better Auth authentication, Prisma persistence, protected workspace guards, shared contracts, server actions, data/services layers, response mappers, organizer management, account bans, audit records, SMTP email delivery, and student email verification.

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
| Participant | `/teams`, `/teams/references`, `/teams/members`, `/teams/submit`, `/teams/settings` | Protected workspace foundation; feature workflows continue in later branches |
| Management | `/panel`, `/panel/announcements`, `/panel/registrations`, `/panel/teams`, `/panel/event`, `/panel/settings` | Organizer-protected workspace foundation; feature workflows continue in later branches |
| Administrator | `/admin`, `/admin/audits`, `/admin/organizers`, `/admin/settings` | Admin-protected workspace; organizer management is implemented, audits/settings remain placeholders |
| Auth protocol | `/api/auth/[...all]` | Better Auth handler; application mutations use server actions |

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
- Admins can ban organizers and teams; organizers can ban teams only. Bans revoke active sessions and create audit records.
- Student email verification uses random hashed tokens, expiry, replacement of outstanding tokens, and atomic single-use consumption.
- SMTP delivery is provider-neutral through `sendEmail`; Better Auth password-reset messages use the same service.
- The active Prisma schema models the single event, teams, team members, registrations, submissions, accounts, sessions, bans, audits, and verification tokens.

Participant registration, organizer operational workflows, audit browsing, and general account-management UI are intentionally deferred.

## Getting started

Requirements: Node.js 22+ and pnpm 10.27+.

```bash
pnpm install
pnpm dev
```

Copy the required values from `.env.example`. The application expects `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and provider-neutral `SMTP_*` settings.

## Prisma workflow

```bash
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

## Contribution workflow

Create or claim an issue, assign yourself, and leave a `Working on this` comment before implementation. Create a focused branch from `dev` using names such as `feat/team-settings`, `fix/sidebar-toggle`, or `docs/project-guide`. Open the pull request into `dev`; release work moves from `dev` to `main` through a separate pull request.

Use squash merges for focused pull requests into `dev` and merge commits for `dev` to `main`. Keep route-specific components beside their page in `_components`, shared components in `components/`, and shadcn-generated primitives in `components/ui`. Do not hand-edit generated UI source.

Update `README.md`, `AGENTS.md`, and `lib/navigation.ts` whenever a route, workflow, command, dependency, or architectural boundary changes.

## Tooling

- Next.js App Router with TypeScript and the `@/*` import alias.
- Prisma 7 with PostgreSQL and the `@prisma/adapter-pg` driver adapter.
- Better Auth for sessions and credentials.
- Tailwind CSS v4, shadcn/ui Base UI components, and Lucide icons.
- Biome for linting and formatting, with Husky/lint-staged checks before commits.

Browse the [shadcn component catalog](https://ui.shadcn.com/docs/components) before adding a primitive:

```bash
pnpm dlx shadcn@latest add <component>
```
