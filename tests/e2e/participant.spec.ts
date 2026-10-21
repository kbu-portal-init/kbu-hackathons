import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function loginAsTeam(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.fill('[name="username"]', "team-orbit");
    await page.fill('[name="password"]', "teampassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/team", { timeout: 15000 });
}

test.describe("participant workspace actions", () => {
    test("notifications page renders with empty state", async ({ page }) => {
        await loginAsTeam(page);
        await page.goto("/team/notifications");
        await expect(page.getByText(/notification/i).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByText("No notifications yet.")).toBeVisible();
    });

    test("submission form renders with required fields", async ({ page }) => {
        await loginAsTeam(page);
        await page.goto("/team/submit");
        await expect(page.locator("#submission-title")).toBeVisible({ timeout: 10000 });
        await expect(page.locator("#submission-summary")).toBeVisible();
        await expect(page.locator("#submission-problem")).toBeVisible();
        await expect(page.locator("#submission-repositoryUrl")).toBeVisible();
        await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Finalize submission" })).toBeVisible();
    });

    test("save submission outside window returns SUBMISSION_CLOSED error", async ({ page }) => {
        await loginAsTeam(page);
        await page.goto("/team/submit");
        await page.fill("#submission-title", "E2E Test Project");
        await page.fill("#submission-summary", "A summary for e2e testing.");
        await page.fill("#submission-problem", "Testing the problem statement field.");
        await page.fill("#submission-targetUsers", "Students");
        await page.fill("#submission-solution", "Our solution description here.");
        await page.fill("#submission-technologyStack", "Next.js, TypeScript");
        await page.fill("#submission-repositoryUrl", "https://github.com/example/repo");

        await page.getByRole("button", { name: "Save draft" }).click();
        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('[role="alert"]')).toContainText(/closed|not open|window/i);
    });

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
