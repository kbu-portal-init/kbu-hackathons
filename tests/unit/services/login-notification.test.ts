import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderNotificationTemplate } from "@/lib/services/email-templates";

describe("login notification template", () => {
    it("includes account details, UTC time, and security guidance", () => {
        const rendered = renderNotificationTemplate("LOGIN_SUCCESS", {
            teamName: "Team One",
            loginEmail: "leader@example.com",
            loginRole: "team",
            loginAt: "2026-09-30T10:15:00.000Z",
        });

        assert.equal(rendered.subject, "Successful sign-in to KBU Hackathon 2026");
        assert.match(rendered.text, /Team One/);
        assert.match(rendered.text, /Account type: team/);
        assert.match(rendered.text, /contact the hackathon organizers/i);
        assert.match(rendered.html ?? "", /Successful sign-in/);
    });

    it("escapes account details", () => {
        const rendered = renderNotificationTemplate("LOGIN_SUCCESS", {
            loginEmail: "<script>alert(1)</script>@example.com",
            loginRole: "admin",
            loginAt: "2026-09-30T10:15:00.000Z",
        });

        assert.doesNotMatch(rendered.html ?? "", /<script>/);
        assert.match(rendered.html ?? "", /&lt;script&gt;/);
    });
});
