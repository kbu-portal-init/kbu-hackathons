import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    assertAdminProvisioningEnvironment,
    assertProductionEnvironment,
    getInvalidEnvironmentVariables,
    getMissingEnvironmentVariables,
} from "@/lib/env";

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
    UPSTASH_REDIS_REST_URL: "https://redis.example.com",
    UPSTASH_REDIS_REST_TOKEN: "token",
    LINE_CONTACT_URL: "https://line.me/R/ti/g/example",
    LINE_CONTACT_NAME: "KBU Hackathon LINE",
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
        environment.LINE_CONTACT_URL = undefined;
        environment.LINE_CONTACT_NAME = undefined;

        assert.deepEqual(getMissingEnvironmentVariables(environment), [
            "NEXT_PUBLIC_APP_URL",
            "R2_BUCKET_NAME",
            "LINE_CONTACT_URL",
            "LINE_CONTACT_NAME",
        ]);
        assert.throws(
            () => assertProductionEnvironment(environment),
            /missing: NEXT_PUBLIC_APP_URL, R2_BUCKET_NAME, LINE_CONTACT_URL, LINE_CONTACT_NAME/,
        );
    });

    it("rejects blank values", () => {
        const environment = {
            ...completeEnvironment,
            SMTP_HOST: "   ",
            LINE_CONTACT_URL: " ",
            LINE_CONTACT_NAME: "\t",
        };

        assert.deepEqual(getMissingEnvironmentVariables(environment), [
            "SMTP_HOST",
            "LINE_CONTACT_URL",
            "LINE_CONTACT_NAME",
        ]);
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

describe("admin provisioning environment validation", () => {
    it("accepts normalized admin addresses and a valid bootstrap password", () => {
        assert.deepEqual(
            assertAdminProvisioningEnvironment({
                ADMIN_USERS: " Admin@Example.com, admin@example.com ",
                ADMIN_DEFAULT_PASSWORD: "temporary-password",
                DATABASE_URL: "postgresql://user:password@localhost:5432/kbu",
            }),
            ["admin@example.com"],
        );
    });

    it("rejects missing or invalid provisioning values", () => {
        assert.throws(
            () => assertAdminProvisioningEnvironment({ ADMIN_USERS: "", ADMIN_DEFAULT_PASSWORD: "short" }),
            /ADMIN_USERS must contain at least one email address/,
        );
        assert.throws(
            () =>
                assertAdminProvisioningEnvironment({
                    ADMIN_USERS: "not-an-email",
                    ADMIN_DEFAULT_PASSWORD: "temporary-password",
                    DATABASE_URL: "postgresql://example",
                }),
            /ADMIN_USERS contains an invalid email address/,
        );
    });
});
