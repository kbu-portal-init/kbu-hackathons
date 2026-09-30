import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { withEnvironment } from "@/tests/helpers/environment";

let sendEmail: typeof import("@/lib/services/email").sendEmail;
const sendMailCalls: Record<string, unknown>[] = [];

const smtpEnvironment = {
    SMTP_HOST: "smtp.example.test",
    SMTP_PORT: "587",
    SMTP_SECURE: "false",
    SMTP_USER: "mailer",
    SMTP_PASSWORD: "secret",
    SMTP_FROM_EMAIL: "noreply@example.test",
};

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

describe("SMTP delivery boundary", () => {
    it("sends the configured from address with the full message", async () => {
        const result = await withEnvironment(smtpEnvironment, () =>
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

    it("throws when any required SMTP setting is missing", async () => {
        for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM_EMAIL"]) {
            await assert.rejects(
                () =>
                    withEnvironment({ ...smtpEnvironment, [key]: undefined }, () =>
                        sendEmail({ to: "a@example.test", subject: "s", text: "t" }),
                    ),
                /SMTP email configuration is incomplete/,
            );
        }
    });
});
