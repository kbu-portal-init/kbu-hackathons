# Single-event database design

Status: proposal. `prisma/schema.prisma` remains the active schema. The companion
`docs/schema.proposed.prisma` is a review artifact, not a migration input until the
application and authentication changes are implemented together.

## Agreed requirements

- One hackathon, with one event settings record.
- Each approved team uses one shared team-name/password login provided by management.
- Admins and organizers use individual email/password logins.
- Members have roster records and notification emails, not login accounts.
- Better Auth owns credentials and sessions. Application code owns notifications.

## Models

| Model | Responsibility |
| --- | --- |
| User, Account, Session, Verification | Better Auth identities, credentials, sessions and tokens. |
| EventSettings | Single event title, description, venue, image URLs, promo URL, registration window, event dates, submission opening/deadline, maximum team capacity and roster limits. |
| Team | Stable team identity, reserved login name, optional image URL and optional provisioned auth account. |
| TeamMember | Roster, student notification email and role such as development, data, design, product, marketing, presentation, or `OTHER`. |
| Registration | One application per team and its current status. |
| RegistrationReview | Append-only decisions, reasons and reviewer identity. |
| Submission | One current project per team, saved as a draft before submission. |
| AuditLog | Management operations and shared-account activity. |

The team and application exist before credentials are issued. `Team.userId` is
nullable until provisioning succeeds. `Team.loginName` reserves the unique name
at registration; provisioning copies it to Better Auth's `User.username`.
After provisioning, these values must stay equal. Renames are management-only,
transactional changes to both records. Names are trimmed, normalized to lowercase,
and validated consistently during reservation and authentication. The display
name is presentation only and is never used to resolve a login.

## Account boundaries

`User.role` stays a string for the Better Auth custom field, with allowed values
`team`, `organizer`, `admin`. Enforce the allowed values with a migration CHECK
constraint and server-side validation; the default is the least privileged `team`.
Role alone does not authorize participation: require a linked approved team.

Team accounts have a generated, unique internal auth email identifier. It is not
a member address or a deliverable mailbox. Do not send verification/reset emails
to it or mark it verified merely because a team was approved. Staff use real auth
emails. Team recovery is proposed to be organizer-managed; staff recovery uses
Better Auth callbacks. Role-specific sign-in and recovery restrictions must be
enforced server-side, including direct calls to Better Auth endpoints.

Member email verification, if later required, needs a separate flow; Better Auth's
`User.emailVerified` does not verify roster addresses. Normalize member emails on
write. The proposal permits the same email on different teams pending an explicit
eligibility policy; it prevents duplicates within a team.

## Lifecycle and enforcement

- Registration: PENDING -> APPROVED or REJECTED; PENDING/APPROVED can be
  WITHDRAWN. A rejected application can be resubmitted as PENDING after correction.
- Every decision writes RegistrationReview and updates Registration in one
  transaction. Reviews store the decision and reason; do not overwrite history.
- On submission for review, validate roster size and at least one `LEADER`. Registration
  data must be complete. Freeze roster and application edits while pending or
  approved; management must explicitly reopen registration to change the roster.
- Approval and login provisioning are distinct operations. Retry provisioning by
  stable team ID, never by promoting any account that happens to share an email.
- Require approval, a non-archived team and the submission deadline for project
  writes. Save drafts with `submittedAt = null`; submitting sets the timestamp.
  This version stores one current project, not submission versions.
- Use conditional updates/transactions for state changes to prevent concurrent
  approval, withdrawal and provisioning from overwriting each other.

Prisma expresses foreign keys, unique keys and indexes. The implementation must
also add PostgreSQL checks for `EventSettings.id = 1`, positive ordered roster
limits, chronological dates, allowed roles, and a partial unique index allowing
at most one captain per team. at least one `LEADER` at submission, login-name
equality, role/team consistency and valid state transitions require service-level
transaction checks (or deliberate database triggers); schema validation alone
does not enforce them.

## Retention and notifications

Archive teams rather than deleting them. Auth-account deletion cannot cascade into
team data. Team children use Restrict; accidental team deletion cannot erase
registration, roster or submissions. Reviewer/actor relations use SetNull, retaining
decision and audit records after staff deletion. Audit details must not contain
passwords, tokens or unnecessary personal data. Shared-account audit entries can
identify the team account, not the individual member operating it.

Approval emails, reminders and confirmations read recipients from TeamMember.
No extra notification table is required for identity design. When delivery is
implemented, add an outbox with per-recipient delivery state and a unique event key
if reliable retries are required. Database approval must not depend on successful
email delivery. Announcements/resources and uploaded-file metadata can be designed
when their publishing/storage requirements are settled; they are outside this
initial account, registration and submission model.

## Adoption plan

1. Create/claim the required GitHub issue and focused branch from dev.
2. Inspect existing data. Backfill TeamProfile into Team and preserve user IDs;
   resolve normalized-name collisions explicitly. Convert existing `user` roles
   only after confirming which records represent team accounts.
3. Add the Better Auth username server/client plugin and its schema fields. Update
   provisioning, auth guards, staff creation, seed, UI and inferred auth types.
4. Backfill business models and required SQL constraints before removing empty
   OrganizerProfile/AdminProfile and legacy TeamProfile. Do not automatically
   approve existing teams without an explicit approval decision.
5. Validate the schema, review generated SQL and run application checks. Test
   provisioning retries, both login methods, cross-role rejection and approval
   gating before applying a migration to a database with retained data.

## Proposal check

`pnpm exec prisma validate --schema docs/schema.proposed.prisma`

This checks Prisma syntax and relations only. It does not migrate a database,
generate the application's client, or validate the business rules above.
