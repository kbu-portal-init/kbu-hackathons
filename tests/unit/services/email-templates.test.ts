import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notificationTypes } from "@/lib/contracts/email";
import { renderCustomEmailTemplate, renderNotificationTemplate } from "@/lib/services/email-templates";

process.env.LINE_CONTACT_URL = "https://line.example/contact?team=<kbu>";
process.env.LINE_CONTACT_NAME = "KBU <Support>";

describe("email templates", () => {
    it("renders every predefined notification with text and branded HTML", () => {
        const data = {
            resetUrl: "https://example.test/reset",
            verificationUrl: "https://example.test/verify",
            teamName: "Team One",
            reason: "Policy",
            expiresAt: "2026-10-01",
        };

        for (const type of notificationTypes) {
            const rendered = renderNotificationTemplate(type, data);
            assert.ok(rendered.subject);
            assert.ok(rendered.text);
            assert.match(rendered.html ?? "", /KBU Hackathon 2026/);
            assert.match(rendered.text, /KBU <Support>: https:\/\/line\.example\/contact\?team=<kbu>/);
            assert.match(rendered.html ?? "", /KBU &lt;Support&gt;/);
            assert.match(rendered.html ?? "", /https:\/\/line\.example\/contact\?team=&lt;kbu&gt;/);
        }
    });

    it("escapes dynamic values in HTML templates", () => {
        const rendered = renderNotificationTemplate("TEAM_REGISTRATION_REJECTED", {
            teamName: "<Team>",
            reason: '<script>alert("x")</script>',
        });

        assert.match(rendered.html ?? "", /&lt;Team&gt;/);
        assert.match(rendered.html ?? "", /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
        assert.doesNotMatch(rendered.html ?? "", /<script>/);
    });

    it("renders manual notification line breaks safely", () => {
        const rendered = renderCustomEmailTemplate("Announcement", "Hello <world>\nSecond line");

        assert.equal(
            rendered.text,
            "Hello <world>\nSecond line\n\nNeed help? Contact KBU <Support>: https://line.example/contact?team=<kbu>",
        );
        assert.match(rendered.html ?? "", /Hello &lt;world&gt;<br \/>Second line/);
        assert.match(rendered.html ?? "", /KBU &lt;Support&gt;/);
        assert.match(rendered.html ?? "", /https:\/\/line\.example\/contact\?team=&lt;kbu&gt;/);
        assert.match(rendered.text, /Need help\? Contact KBU <Support>/);
    });
});
