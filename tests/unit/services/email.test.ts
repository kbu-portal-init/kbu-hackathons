import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let sendEmail: typeof import("@/lib/services/email").sendEmail;
const sendMailCalls: Record<string, unknown>[] = [];
const environmentKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM_EMAIL"];

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    const nodemailer = require("nodemailer") as {
        default: {
            createTransport: (config: unknown) => { sendMail: (options: Record<string, unknown>) => Promise<unknown> };
        };
    };
    nodemailer.default.createTransport = () => ({
        sendMail: async (options: Record<string, unknown>) => {
            sendMailCalls.push(options);
            return { accepted: [options.to] };
        },
    });
    ({ sendEmail } = await import("@/lib/services/email"));
});

function withSmtpConfigured<T>(callback: () => T, overrides: Partial<Record<string, string | undefined>> = {}): T {
    const original = new Map(environmentKeys.map((key) => [key, process.env[key]]));
    process.env.SMTP_HOST = "smtp.example.test";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "mailer";
    process.env.SMTP_PASSWORD = "secret";
    process.env.SMTP_FROM_EMAIL = "noreply@example.test";
    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
    try {
        return callback();
    } finally {
        for (const [key, value] of original) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
}

describe("SMTP delivery boundary", () => {
    it("sends the configured from address with the full message", async () => {
        const result = await withSmtpConfigured(() =>
            sendEmail({
                to: "student@example.test",
                subject: "Welcome",
                text: "Hello",
                html: "<p>Hello</p>",
            }),
        );
        assert.deepEqual((result as { accepted: string[] }).accepted, ["student@example.test"]);
        const sent = sendMailCalls.at(-1);
        assert.equal(sent?.from, "noreply@example.test");
        assert.equal(sent?.to, "student@example.test");
        assert.equal(sent?.subject, "Welcome");
        assert.equal(sent?.text, "Hello");
        assert.equal(sent?.html, "<p>Hello</p>");
    });

    it("throws when any required SMTP setting is missing", () => {
        for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM_EMAIL"]) {
            assert.throws(
                () =>
                    withSmtpConfigured(() => sendEmail({ to: "a@example.test", subject: "s", text: "t" }), {
                        [key]: undefined,
                    }),
                /SMTP email configuration is incomplete/,
            );
        }
    });
});
