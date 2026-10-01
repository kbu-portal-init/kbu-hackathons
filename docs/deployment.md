# Production containers and deployment

- Use Node.js 24 LTS for Docker builds and runtime, with `gcompat` in the shared base. Keep pnpm 10.27.0 in build stages only.
- Preserve standalone output, UID 1001 execution, the localhost web binding, and the private database network.
- Both Compose services require `/opt/hackathon/.env.production`. Do not introduce local environment file fallbacks or interpolated database credential defaults.
- `NEXT_PUBLIC_SENTRY_DSN` is passed to the production image build. `SENTRY_AUTH_TOKEN` is mounted as a BuildKit secret for source-map uploads and must remain unavailable to runtime containers.
- Deployment requires nonempty `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values. Health checks must expand these inside the container using escaped Compose dollar signs.
- Validate with `docker compose --env-file /opt/hackathon/.env.production config --quiet`, `docker compose --env-file /opt/hackathon/.env.production build web`, and `docker compose --env-file /opt/hackathon/.env.production up -d` on the configured host. Check database readiness, HTTP and static asset responses, and `docker compose exec web id -u` (expected `1001`). See README for the full commands.
- Use an isolated test volume for database startup validation. Preserve production volumes; environment changes do not rotate existing database credentials.
- The deployment workflow preflights `/opt/hackathon/.env.production` before image tagging, code updates, builds, or container startup; missing or blank required values must stop deployment without changing the running release.

See `README.md` for the full production Docker deployment section, including the `.env.production` contents and health-check commands.
