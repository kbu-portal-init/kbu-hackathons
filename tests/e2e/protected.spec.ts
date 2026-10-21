import { expect, test } from "@playwright/test";

test("unauthenticated access to /team redirects to login", async ({ page }) => {
    await page.goto("/team");
    await page.waitForURL("**/login");
});

test("unauthenticated access to /panel redirects to login", async ({ page }) => {
    await page.goto("/panel");
    await page.waitForURL("**/login");
});

test("unauthenticated access to /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/login");
});
