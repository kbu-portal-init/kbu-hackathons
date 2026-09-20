export const ErrorCodes = {
    // ─────────────────────────────────────────────────────────────
    // General / Validation
    // ─────────────────────────────────────────────────────────────
    VALIDATION_ERROR: "VALIDATION_ERROR",
    INVALID_STATUS: "INVALID_STATUS",

    // ─────────────────────────────────────────────────────────────
    // Authentication & Authorization
    // ─────────────────────────────────────────────────────────────
    AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
    NOT_AUTHORIZED: "NOT_AUTHORIZED",
    FORBIDDEN: "FORBIDDEN",

    // ─────────────────────────────────────────────────────────────
    // Email Verification & Student Email
    // ─────────────────────────────────────────────────────────────
    EMAIL_EXISTS: "EMAIL_EXISTS",
    INVALID_STUDENT_EMAIL: "INVALID_STUDENT_EMAIL",
    INVALID_VERIFICATION_TOKEN: "INVALID_VERIFICATION_TOKEN",
    EMAIL_VERIFICATION_PENDING: "EMAIL_VERIFICATION_PENDING",
    VERIFICATION_REQUEST_FAILED: "VERIFICATION_REQUEST_FAILED",
    EMAIL_SEND_FAILED: "EMAIL_SEND_FAILED",

    // ─────────────────────────────────────────────────────────────
    // Password
    // ─────────────────────────────────────────────────────────────
    PASSWORD_CHANGE_FAILED: "PASSWORD_CHANGE_FAILED",
    PASSWORD_SETUP_FAILED: "PASSWORD_SETUP_FAILED",

    // ─────────────────────────────────────────────────────────────
    // Profile
    // ─────────────────────────────────────────────────────────────
    PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
    PROFILE_UPDATE_FAILED: "PROFILE_UPDATE_FAILED",

    // ─────────────────────────────────────────────────────────────
    // Organizer
    // ─────────────────────────────────────────────────────────────
    ORGANIZER_NOT_FOUND: "ORGANIZER_NOT_FOUND",

    // ─────────────────────────────────────────────────────────────
    // Team & Team Members
    // ─────────────────────────────────────────────────────────────
    TEAM_NOT_FOUND: "TEAM_NOT_FOUND",
    TEAM_MEMBER_NOT_FOUND: "TEAM_MEMBER_NOT_FOUND",
    TEAM_LEADER_NOT_FOUND: "TEAM_LEADER_NOT_FOUND",
    TEAM_NOT_APPROVED: "TEAM_NOT_APPROVED",
    INVALID_TEAM_SIZE: "INVALID_TEAM_SIZE",

    // ─────────────────────────────────────────────────────────────
    // Registration
    // ─────────────────────────────────────────────────────────────
    REGISTRATION_NOT_FOUND: "REGISTRATION_NOT_FOUND",
    REGISTRATION_CLOSED: "REGISTRATION_CLOSED",
    MAX_TEAMS_REACHED: "MAX_TEAMS_REACHED",

    // ─────────────────────────────────────────────────────────────
    // Event Configuration
    // ─────────────────────────────────────────────────────────────
    EVENT_NOT_CONFIGURED: "EVENT_NOT_CONFIGURED",

    // ─────────────────────────────────────────────────────────────
    // Account Management
    // ─────────────────────────────────────────────────────────────
    ACCOUNT_NOT_BANNABLE: "ACCOUNT_NOT_BANNABLE",
    ACCOUNT_NOT_MANAGEABLE: "ACCOUNT_NOT_MANAGEABLE",

    // ─────────────────────────────────────────────────────────────
    // Storage & Images
    // ─────────────────────────────────────────────────────────────
    IMAGE_NOT_OWNED: "IMAGE_NOT_OWNED",
    STORAGE_NOT_CONFIGURED: "STORAGE_NOT_CONFIGURED",

    // ─────────────────────────────────────────────────────────────
    // Audit Logs
    // ─────────────────────────────────────────────────────────────
    AUDIT_LOG_NOT_FOUND: "AUDIT_LOG_NOT_FOUND",

    // ─────────────────────────────────────────────────────────────
    // Generic CRUD / Operation Errors
    // ─────────────────────────────────────────────────────────────
    CREATE_FAILED: "CREATE_FAILED",
    UPDATE_FAILED: "UPDATE_FAILED",
    DELETE_FAILED: "DELETE_FAILED",
    UPSERT_FAILED: "UPSERT_FAILED",
    APPROVAL_FAILED: "APPROVAL_FAILED",
} as const;
