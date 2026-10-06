# Git branches and pull requests

## Branches

- Before beginning implementation, create or claim the relevant GitHub issue, assign yourself, and add a `Working on this` comment.
- Create each focused branch from `dev`. Open its pull request into `dev`; do not merge feature branches directly into `main`.
- Promote tested integrated work from `dev` to `main` through a separate release pull request.
- `.github/workflows/main-source-branch.yml` validates that `main` pull requests originate from `dev`. Keep its `Require dev source branch` job configured as a required `main` branch status check after the workflow has run.
- `.github/workflows/ci.yml` validates code quality (Biome lint, unit tests, TypeScript typecheck, Next.js build) on PRs to `dev` and `main`. It does not rerun on the merge push to `dev`; the next release PR to `main` validates the integrated `dev` branch.
- `.github/workflows/deploy.yml` triggers automated remote deployment to `/opt/hackathon` on the Debian 13 production host upon push to `main` using the least-privilege `kbu-deploy` service account.
- Use `<type>/<short-description>` in lowercase kebab case, such as `feat/team-settings`, `fix/sidebar-toggle`, `docs/readme`, or `chore/update-dependencies`.
- Keep a branch limited to one coherent change and run the relevant quality checks before handing it off.

## Pull requests

- Open a pull request from the focused branch into `dev` and link the corresponding GitHub issue with `Closes #<issue-number>`. Use a separate `dev` to `main` pull request for a release.
- CodeRabbit automatic and incremental reviews are enabled for pull requests targeting `dev` and `main` through `.coderabbit.yaml`. The configuration must be merged into the target branch before it affects subsequent pull requests; use `@coderabbitai review` for a one-off review.
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
