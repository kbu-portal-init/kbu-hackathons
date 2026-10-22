import { expect, test } from "./fixtures";

async function loginAsTeam(page: import("@playwright/test").Page, username: string, password: string) {
    await page.goto("/login");
    await page.fill('[name="username"]', username);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
}

test.describe("authenticated flows", () => {
    test("team login reaches /team workspace", async ({ page }) => {
        await loginAsTeam(page, "team-orbit", "teampassword");
        await page.waitForURL("**/team", { timeout: 30000 });
        await expect(page.getByRole("heading", { name: "Team Orbit", exact: true })).toBeVisible();
    });

    test("pending team login is blocked with error", async ({ page }) => {
        await loginAsTeam(page, "team-pulse", "teampassword");
        await expect(page).toHaveURL("/login");
        await expect(page.getByText(/pending approval/i)).toBeVisible({ timeout: 10000 });
    });
});
