import { expect, test } from "./fixtures";

test.describe.configure({ mode: "serial" });

async function loginAsTeam(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.fill('[name="username"]', "team-orbit");
    await page.fill('[name="password"]', "teampassword");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/too many requests|unable to authenticate|pending approval/i)).not.toBeVisible({
        timeout: 15000,
    });
    await page.waitForURL("**/team", { timeout: 15000 });
}

test.describe("participant workspace actions", () => {
    test("password change validates and reverts correctly", async ({ page }) => {
        await loginAsTeam(page);
        await page.goto("/team/settings");

        // Wrong current password → error toast
        await page.fill("#team-current-password", "wrongpassword");
        await page.fill("#team-new-password", "newpassword123");
        await page.fill("#team-confirm-password", "newpassword123");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText(/incorrect|could not be changed/i).first()).toBeVisible({ timeout: 10000 });

        // Change to a new password → success toast
        await page.fill("#team-current-password", "teampassword");
        await page.fill("#team-new-password", "teampassword1");
        await page.fill("#team-confirm-password", "teampassword1");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText("Password changed")).toBeVisible({ timeout: 10000 });

        // Revert back so subsequent tests can log in
        await page.fill("#team-current-password", "teampassword1");
        await page.fill("#team-new-password", "teampassword");
        await page.fill("#team-confirm-password", "teampassword");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText("Password changed")).toBeVisible({ timeout: 10000 });
    });
});
