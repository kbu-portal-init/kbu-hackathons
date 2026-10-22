import { test } from "./fixtures";

const routes = [
    "/",
    "/login",
    "/register",
    "/announcements",
    "/resources",
    "/team",
    "/team/notifications",
    "/team/submit",
    "/team/settings",
    "/panel",
    "/panel/event",
    "/panel/registrations",
    "/panel/teams",
    "/panel/announcements",
    "/panel/notifications",
    "/panel/settings",
    "/admin",
    "/admin/organizers",
    "/admin/settings",
    "/admin/audits",
];

test("warm up dev-server route compilation", async ({ page }) => {
    test.setTimeout(240_000);
    for (const route of routes) {
        await page.goto(route, { timeout: 60000 });
    }
});
