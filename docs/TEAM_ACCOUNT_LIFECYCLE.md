# Team Account Lifecycle

## Status Model

Registration status and authentication-account status are separate concepts.

### Registration status

```text
PENDING
APPROVED
REJECTED
WITHDRAWN
```

### Authentication state

Conceptually:

```text
NOT_PROVISIONED
ACTIVE
BANNED/DISABLED
```

Do not assume that `Registration.status === APPROVED` alone is sufficient to determine whether a login account exists.

---

## Provisioning

Recommended order:

```text
Validate all members verified
        |
        v
Create Better Auth user (signUpEmail with random password)
        |
        v
Set username/displayUsername
        |
        v
Link User -> Team
        |
        v
Mark Registration APPROVED
        |
        v
Send password-setup email to team leader
        |
        v
Audit
```

The implementation should make this process idempotent.

If provisioning succeeds but a later database operation fails, retrying the operation should reconcile the existing Better Auth user rather than creating another user.

---

## Removal / Withdrawal

There is currently no UI/functionality for removing an approved team.

When implemented later:

```text
Team withdrawn/removed
        |
        v
Disable/ban Better Auth account
        |
        v
Revoke sessions
        |
        v
Login rejected
```

Prefer preserving the account and audit history rather than hard-deleting it.

---

## Password

The application must never store plaintext passwords.

Use Better Auth's credential/password APIs.

Organizers may:

- set a team password,
- reset a team password.

Teams use the resulting password for shared login.

---

## Shared Account Warning

A shared team account means the authentication system identifies the team, not the individual member.

Therefore:

```text
Team A member 1
Team A member 2
Team A member 3
```

all appear to the authentication system as:

```text
Team A
```

If individual member accountability is required later, the product should introduce per-member accounts or a separate member identity mechanism. Do not try to infer individual identity from the shared team password.

---

## Audit Expectations

At minimum, audit security-sensitive organizer actions:

- Registration approved.
- Registration rejected.
- Member manually verified.
- Team account created.
- Team password set/reset.
- Team account banned/disabled.
- Team account re-enabled.
- Recovery email changed.
- Leader/member ownership changes, if ever supported.

Audit records should identify:

- actor,
- target,
- action,
- timestamp,
- relevant metadata,
- success/failure where appropriate.
