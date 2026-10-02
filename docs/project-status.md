# Project status

## Implemented foundation

The branch currently provides:

- Admin-protected organizer create, list/read, update, ban, and unban workflows.
- Admin and organizer account-ban permissions: admins may target organizers and teams; organizers may target teams only. Bans revoke sessions and write audit records.
- Organizer/admin-triggered student email verification.
- Public announcement and participant-card sharing with mobile native share and desktop copy-link/LINE actions.
- Organizer/admin event settings reads and upserts with Zod validation, ISO-string DTO mapping, atomic persistence, and audit logging.
- Cloudflare R2 storage with server-side proxy uploads, team-owned `uploads/<team-id>/` keys, organizer/admin-owned `uploads/events/` keys, and admin-owned `uploads/admins/<admin-id>/` keys.
- Provider-neutral SMTP delivery through `sendEmail`, with predefined code-owned branded templates in `lib/services/email-templates.ts` and `sendNotification` for Better Auth password resets, student verification, registration updates, account ban/unban, and organizer account-created messages. Templates must provide HTML and plain-text fallbacks and escape dynamic values. SMTP delivery is awaited; delivery outcomes are recorded asynchronously in `AuditLog` and never change the SMTP result. Organizer/team onboarding links are single-use and valid for seven days; ordinary password-reset links remain valid for one hour.
- Prisma data models for the single event, teams, roster members, registrations, submissions, sessions, bans, audits, and verification tokens.
- Organizer/admin team management at `/panel/teams` provides paginated approved-team browsing, submission counts, team detail views, and team ban/unban actions; submissions are shown on the team detail page.
- Organizer/admin manual notifications at `/panel/notifications` can target approved teams or a specific address and choose email, in-app, or both. In-app delivery for a specific address requires a verified member of an approved team; approved team accounts read in-app notifications at `/team/notifications` and can mark them as read.
- Approved teams can save draft project submissions, finalize them during the configured submission window, and view the submission state at `/team/submit`. Organizers can review full submission details from team management and reopen finalized submissions with audit records.

## Remaining / follow-up work

Participant registration workflows, broader organizer management workflows, and broader account-management UI remain follow-up work. Announcement management supports editing both draft and published announcements; published announcements can also be archived. Admins can browse and permanently delete audit records individually; deletion does not create a replacement audit record. The admin audit browser loads user/team-member filter options manually through the paginated `/api/admin/users` route, defaulting to 200 records per request. Admin profile settings update name, email, password, and profile image; admin profile uploads use `uploads/admins/<admin-id>/`.
