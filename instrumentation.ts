import * as Sentry from "@sentry/nextjs";

export async function register() {
    process.setMaxListeners(0);
    Sentry.captureMessage("app started", "info");
}
