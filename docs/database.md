# Database

Prisma 7 uses `prisma7.config.ts`, PostgreSQL, the generated client in `generated/prisma`, and the `@prisma/adapter-pg` driver adapter. The active schema is `prisma/schema.prisma`; design references under `docs/` are not applied unless explicitly applied through migrations.

See also: [`database-design.md`](database-design.md) — data-model decisions, constraints, and adoption plan (design reference only).

Local development uses `docker-compose.local.yml` to run a postgres container on `localhost:5433`. The production `docker-compose.yml` is a full-stack spec with internal networking and no host port mapping. The `db:start`/`db:watch`/`db:stop`/`db:down` scripts reference the local file explicitly via `-f docker-compose.local.yml`.

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

Production administrators are provisioned separately with `pnpm admin:provision`. Set `ADMIN_USERS` and a temporary `ADMIN_DEFAULT_PASSWORD` in `/opt/hackathon/.env.production`, then run the command manually through the released migration image. This is not part of deployment.

Run the provisioning command on the production host from `/opt/hackathon`:

```bash
IMAGE_REPOSITORY=ghcr.io/kbu-portal-init/kbu-hackathons \
IMAGE_TAG=<deployed-commit-sha> \
docker compose --env-file /opt/hackathon/.env.production \
  --profile migrate run --rm migrate pnpm admin:provision
```

The shared password lets operators provision accounts non-interactively and applies only to newly created admins; existing accounts and passwords remain unchanged. Have each new admin change the temporary password immediately through the account password or reset flow, and keep the production environment file root-readable only.

## Database environment variables

- `DATABASE_URL` — the Prisma/PostgreSQL connection string.
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — used by the Docker database and the production Compose deployment.

The full list of required environment categories for local development is in `docs/development-workflow.md`.
