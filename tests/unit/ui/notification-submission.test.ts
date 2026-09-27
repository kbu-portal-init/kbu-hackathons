import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { submitNotification } from "@/app/(management)/panel/notifications/_components/notification-submission";

const input = { subject: "Subject", body: "Body", target: { mode: "ALL_TEAMS" as const } };

describe("notification submission", () => {
    it("clears pending state for a returned failure", async () => {
        const states: boolean[] = [];
        let message = "";
        await submitNotification(
            async () => ({ ok: false, error: { message: "SMTP failed" } }),
            input,
            (value) => (message = value),
            (value) => states.push(value),
        );
        assert.deepEqual(states, [true, false]);
        assert.equal(message, "SMTP failed");
    });

    it("clears pending state and reports thrown failures", async () => {
        const states: boolean[] = [];
        let message = "";
        await submitNotification(
            async () => {
                throw new Error("network failed");
            },
            input,
            (value) => (message = value),
            (value) => states.push(value),
        );
        assert.deepEqual(states, [true, false]);
        assert.equal(message, "The notification could not be sent. Please try again.");
    });

    it("clears pending state and reports successful delivery", async () => {
        const states: boolean[] = [];
        let message = "";
        await submitNotification(
            async () => ({ ok: true, data: { emailRecipientCount: 3, inAppRecipientCount: 2 } }),
            input,
            (value) => (message = value),
            (value) => states.push(value),
        );
        assert.deepEqual(states, [true, false]);
        assert.equal(message, "Sent to 3 email recipient(s) and 2 team inbox(es).");
    });
});
