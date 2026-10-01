# Architecture

**This document describes the CURRENT architecture. The project is NOT currently feature-based.**

KBU Hackathon 2026 is a Next.js App Router application for a single KBU hackathon event. Route groups organize the workspaces without changing their URLs:

- `app/(public)` contains public discovery, registration, and login pages. `/login` is the single login route and switches between participant and management access with tabs.
- `app/(participant)/team` is the approved team workspace.
- `app/(management)/panel` is the organizer panel.
- `app/(admin)/admin` is the elevated administrator panel.
- `app/api/auth/[...all]/route.ts` is the Better Auth protocol endpoint.

Keep page-specific interactive components in a private `_components` directory beside the page. Put components shared by multiple routes in `components/`. `components/ui` contains shadcn-generated source and must not be hand-edited; add components with `pnpm dlx shadcn@latest add <component>`.

Prefer Server Components. Use client components only for browser state, events, forms, mutations, or client-only libraries. Keep navigable public, participant, and management destinations in `lib/navigation.ts`.

## Components and navigation

- Prefer Server Components. Add `"use client"` only when a component needs browser state, events, effects, or a client-only library.
- Keep page files server-rendered where possible; place interactive behavior in focused client components.
- Maintain public, participant, and management link definitions in `lib/navigation.ts`. Update that file whenever a navigation destination changes.
- Update `README.md` and `AGENTS.md` (plus the relevant `docs/` document) whenever a feature, route, workflow, command, dependency, or external documentation link is added, removed, or materially changed. Keep the README route map aligned with the application and `lib/navigation.ts` aligned with navigable routes.
- Reuse application components from `components`. Do not place app-specific UI in `components/ui`.
- `components/ui` is shadcn-generated source. Do not hand-edit it. This project uses shadcn's Base UI configuration; browse the [component catalog](https://ui.shadcn.com/docs/components) and add a component with `pnpm dlx shadcn@latest add <component>`.

## Styling

- Use Tailwind CSS v4 utilities and the semantic CSS variables defined in `app/globals.css`.
- Orange is the product primary color. Use the existing semantic primary utilities or Tailwind orange utilities such as `bg-orange-600`, `text-orange-500`, and `bg-orange-900` when appropriate.
- Preserve the full default Tailwind color palette and the existing shadcn CSS-variable theme.
- Use Lucide icons through `lucide-react`.

## Backend boundaries

Keep dependencies flowing inward:

1. `lib/contracts` contains dependency-light Zod schemas and UI-safe input/output types.
2. `lib/data` contains read-only database queries and pagination.
3. `lib/services` contains business rules, Better Auth calls, mutations, email, and transactions.
4. `lib/mappers` converts persistence/service records into contract DTOs.
5. `actions` are thin server actions: authenticate, validate `unknown` input, delegate, and return typed envelopes.

Prisma models, Better Auth responses, sessions, and exceptions must not cross into pages or client components. Date values at the UI boundary are ISO strings.

Shared responses use `ActionResult<T>`, `ListActionResult<T>`, `ListResult<T>`, and `PaginationMeta`. Validation failures use a generic message plus reusable `fieldErrors`. Lists currently use offset pagination (`page`, `pageSize`, `total`, `hasNextPage`); do not expose Prisma pagination objects.
