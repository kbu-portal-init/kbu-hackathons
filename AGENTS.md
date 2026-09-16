# KBU Hub agent guide

## Architecture

- This is a Next.js App Router project using TypeScript and the `@/*` import alias.
- Route groups organize the application without changing URLs:
  - `app/(public)` contains the public site and its shared header and footer.
  - `app/(participant)/teams` contains the participant workspace.
  - `app/(management)/panel` contains the management workspace.
  - `app/(admin)/admin` contains the administrator workspace.
- Keep public pages available without authentication. Authentication, approval checks, database access, mutations, and redirects are not implemented yet.
- Treat `/teams` as the future approved participant workspace and `/panel` as the future management workspace.
- Treat `/admin` as the future elevated management workspace. Keep it out of public navigation and use the management login flow as its future entry point.

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
- Deployment requires nonempty `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values. Health checks must expand these inside the container using escaped Compose dollar signs.
- Validate with `docker compose config --quiet`, `docker compose build web`, and `docker compose up -d` on the configured host. Check database readiness, HTTP and static asset responses, and `docker compose exec web id -u` (expected `1001`). See README for the full commands.
- Use an isolated test volume for database startup validation. Preserve production volumes; environment changes do not rotate existing database credentials.

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
