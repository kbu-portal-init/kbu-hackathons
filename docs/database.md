# Database

Prisma 7 uses `prisma7.config.ts`, PostgreSQL, the generated client in `generated/prisma`, and the `@prisma/adapter-pg` driver adapter. The active schema is `prisma/schema.prisma`; design references under `docs/` are not applied unless explicitly applied through migrations.

See also: [`database-design.md`](database-design.md) — data-model decisions, constraints, and adoption plan (design reference only).

Local development uses `docker-compose.local.yml` to run a postgres container on `localhost:5432`. The production `docker-compose.yml` is a full-stack spec with internal networking and no host port mapping. The `db:start`/`db:watch`/`db:stop`/`db:down` scripts reference the local file explicitly via `-f docker-compose.local.yml`.

## Commands

```bash
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

## Database environment variables

- `DATABASE_URL` — the Prisma/PostgreSQL connection string.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — used by the Docker database and the production Compose deployment.

The full list of required environment categories for local development is in `docs/development-workflow.md`.
