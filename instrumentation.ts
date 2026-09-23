import * as Sentry from "@sentry/nextjs";

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
            const { assertProductionEnvironment } = await import("./lib/env");
            assertProductionEnvironment();
        }

        await import("./sentry.server.config");
        Sentry.captureMessage("KBU Hackathon 2026 server started successfully", "info");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config");
    }
}

export const onRequestError = Sentry.captureRequestError;
