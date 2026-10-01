# Authentication and roles

Better Auth is configured in `lib/auth/config.ts` with the Prisma adapter, email/password authentication, username support, and admin capabilities. The supported `User.role` values are:

- `team`: one shared username/password account per team.
- `organizer`: staff account using email/password.
- `admin`: elevated staff account using email/password.

Team members are roster records, not Better Auth users. Their `studentEmail` is used for notifications and organizer-triggered verification. Student verification stores hashed, expiring, single-use tokens and sets `studentEmailVerifiedAt`.

`lib/auth/guards.ts` is the access-control boundary. It checks sessions, active bans, roles, and approved team registration status. Banned accounts are denied while a ban is active; an expired ban no longer blocks access. Keep authorization in guards and services, never only in UI code.

## Bans and session revocation

- Admin and organizer account-ban permissions: admins may target organizers and teams; organizers may target teams only.
- Bans revoke sessions and write audit records.

## Verification and reset links

- Organizer/team onboarding links are single-use and valid for seven days; ordinary password-reset links remain valid for one hour.
- Student email verification uses random hashed tokens with expiry, replacement of outstanding tokens, and atomic single-use consumption.

Notification delivery details (templates, SMTP, `sendNotification`) are covered in `docs/project-status.md` and `lib/services/email-templates.ts`.

## Detailed flow specifications

- `docs/login-flow.md` — team username/password login, sessions, banned/disabled accounts, password reset, authorization matrix, magic-link prohibition.
- `docs/registration-flow.md` — registration submission, student email verification, organizer approval, team account provisioning, rejection/withdrawal.
- `docs/team-account-lifecycle.md` — registration vs. authentication status model, provisioning order, shared-account warning, audit expectations.

These are business-flow specifications, not implementation status; some flows (registration) are not yet implemented. See `docs/project-status.md` for what currently exists.
