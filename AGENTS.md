# KBU Hackathon 2026 contributor guide

KBU Hackathon 2026 is a Next.js App Router application for a single KBU hackathon event. It provides public event information and the foundation for team, organizer, and administrator panels.

## Current architecture

```text
app/  actions/  components/  hooks/  lib/  prisma/  tests/  docs/
lib/: auth/ contracts/ data/ services/ mappers/
```

- Route groups organize workspaces without changing URLs: `app/(public)` (public pages and `/login`), `app/(participant)/team` (approved team workspace), `app/(management)/panel` (organizer panel), `app/(admin)/admin` (administrator panel). `app/api/auth/[...all]/route.ts` is the Better Auth protocol endpoint.
- Keep page-specific interactive components in a private `_components` directory beside the page. Put components shared by multiple routes in `components/`. `components/ui` is shadcn-generated source and must not be hand-edited; add components with `pnpm dlx shadcn@latest add <component>` (Base UI configuration, see the [component catalog](https://ui.shadcn.com/docs/components)). Do not place app-specific UI in `components/ui`.
- Prefer Server Components. Add `"use client"` only when a component needs browser state, events, effects, forms, mutations, or a client-only library. Keep page files server-rendered where possible.
- Full details: [`docs/architecture.md`](docs/architecture.md).

## Rules that always apply

- Read `AGENTS.md` before starting any task, then only the `docs/` document relevant to your task (routing table below).
- Maintain public, participant, and management link definitions in `lib/navigation.ts`; update it whenever a navigation destination changes.
- Update `README.md`, this file, and the relevant `docs/` document whenever a feature, route, workflow, command, dependency, or external documentation link is added, removed, or materially changed. Keep the README route map aligned with the application.
- Reuse application components from `components`. Match the existing code style; do not introduce a new pattern without flagging it in the commit/PR description.
- Keep authorization in guards and services, never only in UI code.
- Never run the development seed against production.

## Authentication summary

Better Auth is configured in `lib/auth/config.ts` with the Prisma adapter, email/password authentication, username support, and admin capabilities. Supported `User.role` values: `team` (one shared username/password account per team), `organizer` (staff email/password), `admin` (elevated staff email/password). Team members are roster records, not Better Auth users; their `studentEmail` is used for notifications and organizer-triggered verification (hashed, expiring, single-use tokens setting `studentEmailVerifiedAt`). `lib/auth/guards.ts` is the access-control boundary: it checks sessions, active bans, roles, and approved team registration status; banned accounts are denied while a ban is active, an expired ban no longer blocks. Details: [`docs/authentication.md`](docs/authentication.md).

## Backend boundaries summary

Keep dependencies flowing inward: `lib/contracts` → `lib/data` → `lib/services` → `lib/mappers` → `actions` → UI. Prisma models, Better Auth responses, sessions, and exceptions must not cross into pages or client components; date values at the UI boundary are ISO strings. Shared responses use `ActionResult<T>`, `ListActionResult<T>`, `ListResult<T>`, and `PaginationMeta`; validation failures use a generic message plus `fieldErrors`; lists use offset pagination (`page`, `pageSize`, `total`, `hasNextPage`) and never expose Prisma pagination objects. Details: [`docs/architecture.md`](docs/architecture.md).

## Styling

- Use Tailwind CSS v4 utilities and the semantic CSS variables defined in `app/globals.css`.
- Orange is the product primary color. Use the existing semantic primary utilities or Tailwind orange utilities such as `bg-orange-600`, `text-orange-500`, and `bg-orange-900` when appropriate.
- Preserve the full default Tailwind color palette and the existing shadcn CSS-variable theme.
- Use Lucide icons through `lucide-react`.

## Quality checks

Run the relevant checks before finishing a change:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Biome intentionally excludes `components/ui`. Do not use a whole-project formatter command to modify those generated files. Husky runs lint-staged before commits.

## Git rules summary

- Create or claim the GitHub issue first; assign yourself and comment `Working on this`.
- Branch from `dev` as `<type>/<short-description>` (lowercase kebab case, e.g. `feat/team-settings`); open the PR into `dev`, never directly into `main`.
- Release `dev` → `main` through a separate pull request. Squash-and-merge feature PRs into `dev`; use a merge commit for `dev` → `main` so `dev` stays an ancestor of `main`.
- Link issues with `Closes #<issue-number>` and run the quality checks before handing off. Details, workflows, and the PR body template: [`docs/git-workflow.md`](docs/git-workflow.md).

## AI coding agents

This repo is shared by several AI coding agents with assigned roles, model mappings, branch rules (`agent/<tool-name>/<short-task-name>`), one-agent-per-file/branch rules, and review expectations. Read [`docs/ai-workflow.md`](docs/ai-workflow.md) before starting a task.

## Documentation Routing

| Area | Documentation |
|---|---|
| Architecture / code organization | `docs/architecture.md` |
| Auth / roles / guards / verification | `docs/authentication.md` |
| Registration / login / team-account flows | `docs/login-flow.md`, `docs/registration-flow.md`, `docs/team-account-lifecycle.md` |
| Prisma / PostgreSQL / migrations | `docs/database.md` |
| Database design reference | `docs/database-design.md` |
| Cloudflare R2 / uploads | `docs/storage.md` |
| Local development / quality checks | `docs/development-workflow.md` |
| Docker / production / deployment | `docs/deployment.md` |
| Branches / PRs / commits | `docs/git-workflow.md` |
| AI coding agents | `docs/ai-workflow.md` |
| Implemented features / remaining work | `docs/project-status.md` |

Agents should only need to read the detailed document relevant to their task.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

**Reminder: feature-based architecture is NOT currently adopted. Do not reorganize the codebase into `features/` — keep the current `app/ actions/ components/ hooks/ lib/ prisma/ tests/ docs/` structure.**
