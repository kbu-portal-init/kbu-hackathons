import { expect, test } from "@playwright/test";

async function loginAsTeam(page: import("@playwright/test").Page, username: string, password: string) {
    await page.goto("/login");
    await page.fill('[name="username"]', username);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
}

async function loginAsStaff(page: import("@playwright/test").Page, email: string, password: string) {
    await page.goto("/login");
    await page.getByRole("button", { name: "Organizer" }).click();
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
}

test.describe("authenticated flows", () => {
    test("team login reaches /team workspace", async ({ page }) => {
        await loginAsTeam(page, "team-orbit", "teampassword");
        await page.waitForURL("**/team", { timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Team Orbit" })).toBeVisible();
    });

    test("pending team login is blocked with error", async ({ page }) => {
        await loginAsTeam(page, "team-pulse", "teampassword");
        await expect(page).toHaveURL("/login");
        await expect(page.getByText(/pending approval/i)).toBeVisible({ timeout: 10000 });
    });

    test("organizer login reaches /panel", async ({ page }) => {
        await loginAsStaff(page, "organizer@ms.kbu.ac.th", "organizerpassword");
        await page.waitForURL("**/panel", { timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Management panel" })).toBeVisible();
    });

    test("admin login reaches /admin", async ({ page }) => {
        await loginAsStaff(page, "admin@ms.kbu.ac.th", "adminpassword");
        await page.waitForURL("**/panel", { timeout: 15000 });
        await page.goto("/admin");
        await expect(page.getByRole("heading", { name: "Administrator panel" })).toBeVisible();
    });

    test("sign out returns to home page", async ({ page }) => {
        await loginAsTeam(page, "team-orbit", "teampassword");
        await page.waitForURL("**/team", { timeout: 15000 });

        await page.getByRole("button", { name: /open account menu/i }).click();
        await page.getByRole("button", { name: "Sign out" }).first().click();
        await page.getByRole("button", { name: "Sign out" }).last().click();

        await page.waitForURL("**/", { timeout: 15000 });
        await expect(page).not.toHaveURL(/\/team/);
    });
});
