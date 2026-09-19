import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertProductionEnvironment, getInvalidEnvironmentVariables, getMissingEnvironmentVariables } from "@/lib/env";

const completeEnvironment: Record<string, string | undefined> = {
    NEXT_PUBLIC_APP_URL: "https://hackathon.example.com",
    DATABASE_URL: "postgresql://user:password@localhost:5432/kbu",
    BETTER_AUTH_SECRET: "secret",
    BETTER_AUTH_URL: "https://hackathon.example.com",
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: "587",
    SMTP_SECURE: "false",
    SMTP_USER: "mailer",
    SMTP_PASSWORD: "password",
    SMTP_FROM_EMAIL: "KBU <noreply@example.com>",
    R2_ENDPOINT: "https://account.r2.cloudflarestorage.com",
    R2_ACCESS_KEY_ID: "access",
    R2_SECRET_ACCESS_KEY: "secret",
    R2_BUCKET_NAME: "bucket",
    NEXT_PUBLIC_R2_PUBLIC_URL: "https://media.example.com",
};

describe("production environment validation", () => {
    it("accepts a complete valid environment", () => {
        assert.doesNotThrow(() => assertProductionEnvironment(completeEnvironment));
        assert.deepEqual(getMissingEnvironmentVariables(completeEnvironment), []);
        assert.deepEqual(getInvalidEnvironmentVariables(completeEnvironment), []);
    });

    it("reports all missing variables", () => {
        const environment = { ...completeEnvironment };
        environment.NEXT_PUBLIC_APP_URL = undefined;
        environment.R2_BUCKET_NAME = undefined;

        assert.deepEqual(getMissingEnvironmentVariables(environment), ["NEXT_PUBLIC_APP_URL", "R2_BUCKET_NAME"]);
        assert.throws(() => assertProductionEnvironment(environment), /missing: NEXT_PUBLIC_APP_URL, R2_BUCKET_NAME/);
    });

    it("rejects blank values", () => {
        const environment = { ...completeEnvironment, SMTP_HOST: "   " };

        assert.deepEqual(getMissingEnvironmentVariables(environment), ["SMTP_HOST"]);
    });

    it("rejects invalid URLs and SMTP ports", () => {
        const environment = {
            ...completeEnvironment,
            NEXT_PUBLIC_APP_URL: "not-a-url",
            BETTER_AUTH_URL: "ftp://auth.example.com",
            SMTP_PORT: "smtp",
        };

        assert.deepEqual(getInvalidEnvironmentVariables(environment), [
            "NEXT_PUBLIC_APP_URL",
            "BETTER_AUTH_URL",
            "SMTP_PORT",
        ]);
    });
});
