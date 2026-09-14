# KBU Hub

KBU Hub is the web platform for discovering KBU hackathons, reading announcements, and finding resources for students. It also provides the starting point for participant and management workspaces.

## Current status

The project currently provides a responsive UI shell and placeholder dashboard pages. Authentication, team-registration approval checks, data storage, and form submissions have not been implemented yet.

Public pages are available to everyone. The `/teams` participant workspace and `/panel` management workspace are visual placeholders until access control is designed.

## Routes

| Area | Routes | Purpose |
| --- | --- | --- |
| Public | `/`, `/events`, `/announcements`, `/resources`, `/about` | Discover hackathons, community updates, and student resources. |
| Registration | `/register` | Explain the future team registration and approval process. |
| Login | `/login`, `/login/participant`, `/login/management` | Choose an access type and view the corresponding dummy login form. |
| Participant dashboard | `/teams`, `/teams/references`, `/teams/members`, `/teams/submit`, `/teams/settings` | Future approved-team workspace. |
| Management dashboard | `/panel`, `/panel/announcements`, `/panel/registrations`, `/panel/teams`, `/panel/event`, `/panel/organizers`, `/panel/settings` | Future organizer and administrator workspace. |

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

The `Validate main pull request source` GitHub Actions workflow rejects a `main` pull request unless its source branch is `dev`. After it first runs, configure its `Require dev source branch` job as a required status check in the `main` branch ruleset.

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
