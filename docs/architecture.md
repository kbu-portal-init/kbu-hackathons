# Architecture

**This document describes the CURRENT architecture. The project is NOT currently feature-based.**

KBU Hackathon 2026 is a Next.js App Router application for a single KBU hackathon event. Route groups organize the workspaces without changing their URLs:

- `app/(public)` contains public discovery, the consolidated participant information on the homepage, registration, and login pages. `/login` is the single login route and switches between participant and management access with tabs.
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
- Administrator and management layouts own dashboard page padding (`p-4 sm:p-6 lg:p-8`). Their pages must not add another outer padding container; use `DashboardPageHeader` and `space-y-8` for consistent page chrome.
- Update `README.md` and `AGENTS.md` (plus the relevant `docs/` document) whenever a feature, route, workflow, command, dependency, or external documentation link is added, removed, or materially changed. Keep the README route map aligned with the application and `lib/navigation.ts` aligned with navigable routes.
- Reuse application components from `components`. Do not place app-specific UI in `components/ui`.
- `components/ui` is shadcn-generated source. Do not hand-edit it. This project uses shadcn's Base UI configuration; browse the [component catalog](https://ui.shadcn.com/docs/components) and add a component with `pnpm dlx shadcn@latest add <component>`.

## Loading states and navigation

- The root layout uses `nextjs-toploader` for a thin orange browser-style progress bar during client navigation. This complements, rather than replaces, page-level `Suspense` fallbacks.
- No route group has a segment-level `loading.tsx` (`app/(public)`, `(participant)/team`, `(management)/panel`, `(admin)/admin`). A `loading.js` boundary makes Next.js prefetch only the layout up to that boundary and disables the client router cache for the route, so navigation re-fetched and swapped a shell in on every visit.
- Pages are synchronous composition surfaces. Static chrome and section headings render first; only the data-dependent body sits inside `<Suspense>`. Resolve route props with `params.then()` / `searchParams.then()` inside the boundary, or extract the body into an async page-local content component rendered only inside the boundary.
- Auth guards stay outside the boundary: layouts and pages await `lib/auth/guards.ts` before rendering, so denied users get the guard's own result rather than a skeleton.
- Dashboard pages draw their fallbacks from the shared primitives in `components/dashboard-skeletons.tsx` (`DashboardListSkeleton`, `DashboardFormSkeleton`, `DashboardDetailSkeleton`, `DashboardCardGridSkeleton`, `DashboardStatGridSkeleton`). Public pages keep page-local skeletons in the page file. All fallbacks are built from `components/ui/skeleton` with the existing fills (`bg-zinc-100` for text bars, `bg-orange-100` for titles and accents, `bg-orange-50` for media blocks) so loading UI matches the page that replaces it.
- Each dashboard route group has an `error.tsx` (`app/(admin)/admin/error.tsx`, `app/(management)/panel/error.tsx`, `app/(participant)/team/error.tsx`) for render failures inside the boundary.
- Fallbacks that stand in for visible UI carry `role="status"` and an `aria-label`. Never `fallback={null}` for visible UI.
- `next.config.ts` sets `experimental.staleTimes.dynamic` to `30` so back/forward navigation to dynamic public routes replays from the client router cache instead of refetching.
- `app/(public)/page.tsx` is the exception: its read stays outside any boundary because `components/scroll-fx` scans `[data-reveal]` once on mount, and content that streams in afterwards would be skipped and stay hidden under `.fx-armed`.
- Work that follows these rules is guided by the `nextjs-app-architecture` skill in `.agents/skills/`.

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
