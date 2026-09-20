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

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorMessages: Record<ErrorCode, string> = {
    // General / Validation
    [ErrorCodes.VALIDATION_ERROR]: "Some fields are invalid",
    [ErrorCodes.INVALID_STATUS]: "Invalid status",

    // Authentication & Authorization
    [ErrorCodes.AUTHENTICATION_FAILED]: "Unable to authenticate. Please try again.",
    [ErrorCodes.NOT_AUTHORIZED]: "Not authorized",
    [ErrorCodes.FORBIDDEN]: "Access denied",

    // Email Verification & Student Email
    [ErrorCodes.EMAIL_EXISTS]: "A user with this email already exists",
    [ErrorCodes.INVALID_STUDENT_EMAIL]: "Student email is invalid",
    [ErrorCodes.INVALID_VERIFICATION_TOKEN]: "Invalid or expired verification token",
    [ErrorCodes.EMAIL_VERIFICATION_PENDING]: "Email verification is pending",
    [ErrorCodes.VERIFICATION_REQUEST_FAILED]: "Unable to prepare verification email",
    [ErrorCodes.EMAIL_SEND_FAILED]: "Unable to send email",

    // Password
    [ErrorCodes.PASSWORD_CHANGE_FAILED]: "Current password is incorrect or password could not be changed",
    [ErrorCodes.PASSWORD_SETUP_FAILED]: "Password setup link could not be prepared",

    // Profile
    [ErrorCodes.PROFILE_NOT_FOUND]: "Profile not found",
    [ErrorCodes.PROFILE_UPDATE_FAILED]: "Failed to update profile",

    // Organizer
    [ErrorCodes.ORGANIZER_NOT_FOUND]: "Organizer not found",

    // Team & Team Members
    [ErrorCodes.TEAM_NOT_FOUND]: "Team not found",
    [ErrorCodes.TEAM_MEMBER_NOT_FOUND]: "Team member not found",
    [ErrorCodes.TEAM_LEADER_NOT_FOUND]: "Team leader not found",
    [ErrorCodes.TEAM_NOT_APPROVED]: "Your team must be approved before you can sign in",
    [ErrorCodes.INVALID_TEAM_SIZE]: "Invalid team size",

    // Registration
    [ErrorCodes.REGISTRATION_NOT_FOUND]: "Registration not found",
    [ErrorCodes.REGISTRATION_CLOSED]: "Registration is not currently open",
    [ErrorCodes.MAX_TEAMS_REACHED]: "Maximum number of teams has been reached",

    // Event Configuration
    [ErrorCodes.EVENT_NOT_CONFIGURED]: "Event settings are not configured",

    // Account Management
    [ErrorCodes.ACCOUNT_NOT_BANNABLE]: "This account cannot be banned",
    [ErrorCodes.ACCOUNT_NOT_MANAGEABLE]: "This account cannot be managed",

    // Storage & Images
    [ErrorCodes.IMAGE_NOT_OWNED]: "Image must be uploaded to your storage area",
    [ErrorCodes.STORAGE_NOT_CONFIGURED]: "Storage is not configured",

    // Audit Logs
    [ErrorCodes.AUDIT_LOG_NOT_FOUND]: "Audit log not found",

    // Generic CRUD / Operation Errors
    [ErrorCodes.CREATE_FAILED]: "Failed to create",
    [ErrorCodes.UPDATE_FAILED]: "Failed to update",
    [ErrorCodes.DELETE_FAILED]: "Failed to delete",
    [ErrorCodes.UPSERT_FAILED]: "Failed to save",
    [ErrorCodes.APPROVAL_FAILED]: "Failed to approve",
};
