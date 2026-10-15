# Production containers and deployment

- Production images are built in GitHub Actions and published to GitHub Container Registry with the commit SHA as an immutable tag. GitHub Actions copies the matching `docker-compose.yml` to the host, which then pulls and runs those images; the host does not need a Git checkout or build the application.
- The workflow also publishes a `-builder` image for the one-shot Prisma migration service. BuildKit's GitHub Actions cache is shared by the runtime and migration builds.

- Use Node.js 24 LTS for Docker builds and runtime, with `gcompat` in the shared base. Keep pnpm 10.27.0 in build stages only.
- Preserve standalone output, UID 1001 execution, the localhost web binding, and the private database network.
- Both Compose services require `/opt/hackathon/.env.production`. Do not introduce local environment file fallbacks or interpolated database credential defaults.
- `NEXT_PUBLIC_SENTRY_DSN` and the optional `NEXT_PUBLIC_GA_ID` are passed from GitHub Actions repository variables to the production image build. `SENTRY_AUTH_TOKEN` is passed from the GitHub Actions secret as a BuildKit secret for source-map uploads and must remain unavailable to runtime containers.
- Deployment requires nonempty `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values. Health checks must expand these inside the container using escaped Compose dollar signs.
- Use an isolated test volume for database startup validation. Preserve production volumes; environment changes do not rotate existing database credentials.
- The deployment workflow preflights `/opt/hackathon/.env.production` before image tagging, code updates, builds, or container startup; missing or blank required values must stop deployment without changing the running release.
- After building, the workflow runs `docker compose --profile migrate run --rm migrate` to apply pending Prisma migrations via the one-shot `migrate` service. This service uses the Dockerfile `builder` stage (which has pnpm and Prisma) and exits after completion. It is gated behind the `migrate` profile so it never starts during normal `docker compose up`.
- On migration failure or health-check failure, the workflow dumps the last 200 lines of relevant container logs (`web`, `migrate`) to stdout before executing the rollback, so the root cause is visible in GitHub Actions output.
- After a successful health check, the workflow removes obsolete local tags for the application repository while retaining the current runtime tag, current `-builder` tag, and `:rollback`. It does not delete GHCR registry tags or unrelated local images; dangling-image cleanup still runs afterward.

## Host environment and verification

Create `/opt/hackathon/.env.production` on the host with restricted permissions. Set a unique production database password before deployment. This snippet shows the database values; add the other required production settings listed in the [development workflow](development-workflow.md):

```dotenv
POSTGRES_DB=kbu_hackathon
POSTGRES_USER=kbu_hackathon
POSTGRES_PASSWORD=<set-a-unique-production-password>
```

The workflow validates this file and all other required nonblank runtime values before changing the running release. Use `config --quiet` when validating Compose so credentials are not printed. Existing PostgreSQL volumes retain their original credentials; changing this file does not rotate a database password.

To verify a specific release from the production host:

```bash
export IMAGE_REPOSITORY=ghcr.io/kbu-portal-init/kbu-hackathons
export IMAGE_TAG=<commit-sha>
docker compose --env-file /opt/hackathon/.env.production config --quiet
docker compose --env-file /opt/hackathon/.env.production up -d
docker compose --env-file /opt/hackathon/.env.production ps
docker compose --env-file /opt/hackathon/.env.production exec web id -u
docker compose --env-file /opt/hackathon/.env.production exec db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
curl --fail http://127.0.0.1:3000/
```

Expect UID `1001`, a healthy database, and a successful HTTP response. Verify that a `/_next/static/` asset referenced by the returned HTML also responds successfully. The web port is bound to localhost for a host reverse proxy; PostgreSQL has no published port. Validate fresh database startup with a separate test volume and never remove the production `postgres_data` volume as part of testing.

BuildKit cache cleanup is intentionally excluded from deployment because it can exceed the remote command timeout. Run it separately during maintenance after checking available disk space, for example with `docker builder prune -f --filter "until=168h"`.
