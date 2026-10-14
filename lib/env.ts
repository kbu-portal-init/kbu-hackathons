const REQUIRED_ENV_VARS = [
    "NEXT_PUBLIC_APP_URL",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL",
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "NEXT_PUBLIC_R2_PUBLIC_URL",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "LINE_CONTACT_URL",
    "LINE_CONTACT_NAME",
] as const;

export type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];
export type EnvironmentValues = Record<string, string | undefined>;

export function assertAdminProvisioningEnvironment(env: EnvironmentValues = process.env): string[] {
    const emails = Array.from(
        new Set(
            (env.ADMIN_USERS ?? "")
                .split(",")
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean),
        ),
    );

    if (emails.length === 0) throw new Error("ADMIN_USERS must contain at least one email address");
    if (emails.some((email) => !/^\S+@\S+\.\S+$/.test(email)))
        throw new Error("ADMIN_USERS contains an invalid email address");
    if (!env.DATABASE_URL || env.DATABASE_URL.trim().length === 0) throw new Error("DATABASE_URL is required");

    const bootstrapPassword = env.ADMIN_DEFAULT_PASSWORD ?? "";
    if (bootstrapPassword.length < 8) throw new Error("ADMIN_DEFAULT_PASSWORD must be at least 8 characters");

    return emails;
}

function isBlank(value: string | undefined): boolean {
    return !value || value.trim().length === 0;
}

export function getMissingEnvironmentVariables(env: EnvironmentValues = process.env): RequiredEnvVar[] {
    return REQUIRED_ENV_VARS.filter((name) => isBlank(env[name]));
}

export function getInvalidEnvironmentVariables(env: EnvironmentValues = process.env): string[] {
    const invalid: string[] = [];

    for (const name of ["NEXT_PUBLIC_APP_URL", "BETTER_AUTH_URL"] as const) {
        const value = env[name];
        if (value && value.trim().length > 0) {
            try {
                const url = new URL(value.trim());
                if (!url.protocol.startsWith("http") || !url.host) invalid.push(name);
            } catch {
                invalid.push(name);
            }
        }
    }

    const smtpPort = env.SMTP_PORT;
    if (smtpPort && smtpPort.trim().length > 0 && !/^\d+$/.test(smtpPort.trim())) invalid.push("SMTP_PORT");

    return invalid;
}

export function assertProductionEnvironment(env: EnvironmentValues = process.env): void {
    const missing = getMissingEnvironmentVariables(env);
    const invalid = getInvalidEnvironmentVariables(env);

    if (missing.length === 0 && invalid.length === 0) return;

    const problems = [
        missing.length > 0 ? `missing: ${missing.join(", ")}` : null,
        invalid.length > 0 ? `invalid: ${invalid.join(", ")}` : null,
    ].filter(Boolean);

    throw new Error(`Production environment validation failed (${problems.join("; ")}).`);
}
