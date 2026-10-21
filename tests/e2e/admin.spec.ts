import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function loginAsAdmin(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.getByRole("button", { name: "Organizer" }).click();
    await page.fill('[name="email"]', "admin@ms.kbu.ac.th");
    await page.fill('[name="password"]', "adminpassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/panel", { timeout: 15000 });
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Administrator panel" })).toBeVisible({ timeout: 10000 });
}

test.describe("admin panel actions", () => {
    test("create organizer account", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/organizers");

        const email = `e2e-org-${Date.now()}@example.com`;
        await page.getByRole("button", { name: "Create organizer" }).click();
        await page.fill("#name", "E2E Organizer");
        await page.fill("#email", email);
        await page.fill("#password", "e2eorgpassword123");
        await page.getByRole("button", { name: "Create", exact: true }).click();
        await expect(page.getByText("Organizer created")).toBeVisible({ timeout: 15000 });
    });

    test("update organizer details", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/organizers");

        // Use organizer2 (won't collide with panel tests that use organizer1)
        const row = page.getByRole("row").filter({ hasText: "Secondary Organizer" });
        await row.getByRole("button", { name: "Edit" }).click();

        await page.fill("#name", "E2E Secondary");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(page.getByText("Organizer updated")).toBeVisible({ timeout: 15000 });

        // Revert
        const updatedRow = page.getByRole("row").filter({ hasText: "E2E Secondary" });
        await updatedRow.getByRole("button", { name: "Edit" }).click();
        await page.fill("#name", "Secondary Organizer");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(page.getByText("Organizer updated")).toBeVisible({ timeout: 15000 });
    });

    test("ban and unban organizer account", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/organizers");

        // Ban organizer2
        const banRow = page.getByRole("row").filter({ hasText: "Secondary Organizer" });
        await banRow.getByRole("button", { name: "Ban" }).click();
        await page.fill("#reason", "E2E test ban.");
        await page.getByRole("button", { name: "Confirm ban" }).click();
        await expect(page.getByText("Organizer banned")).toBeVisible({ timeout: 15000 });

        // Unban organizer2
        await page.goto("/admin/organizers");
        const unbanRow = page.getByRole("row").filter({ hasText: "Secondary Organizer" });
        await unbanRow.getByRole("button", { name: "Unban" }).first().click();
        await page.getByRole("button", { name: "Unban" }).last().click();
        await expect(page.getByText("Organizer unbanned")).toBeVisible({ timeout: 15000 });
    });

    test("update admin profile with revert", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/settings");
        await expect(page.locator("#name")).toBeVisible({ timeout: 10000 });

        await page.fill("#name", "E2E Admin");
        await page.getByRole("button", { name: "Save profile" }).click();
        await expect(page.getByText("Profile updated")).toBeVisible({ timeout: 10000 });

        // Revert
        await page.fill("#name", "Super Admin");
        await page.getByRole("button", { name: "Save profile" }).click();
        await expect(page.getByText("Profile updated")).toBeVisible({ timeout: 10000 });
    });

    test("change admin password with validation and revert", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/settings");

        // Wrong current password → error
        await page.fill("#admin-current-password", "wrongpassword");
        await page.fill("#admin-new-password", "newpassword123");
        await page.fill("#admin-confirm-password", "newpassword123");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText(/incorrect|could not be changed/i).first()).toBeVisible({ timeout: 10000 });

        // Change and revert
        await page.fill("#admin-current-password", "adminpassword");
        await page.fill("#admin-new-password", "adminpassword1");
        await page.fill("#admin-confirm-password", "adminpassword1");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText("Password changed")).toBeVisible({ timeout: 10000 });

        await page.fill("#admin-current-password", "adminpassword1");
        await page.fill("#admin-new-password", "adminpassword");
        await page.fill("#admin-confirm-password", "adminpassword");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText("Password changed")).toBeVisible({ timeout: 10000 });
    });

    test("delete audit log entry", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/audits");
        await expect(page.getByRole("button", { name: "Filter" })).toBeVisible({ timeout: 10000 });

        // Delete the first audit log row
        const firstDelete = page.getByRole("row").getByRole("button", { name: "Delete" }).first();
        await firstDelete.click();
        await page.getByRole("button", { name: "Delete", exact: true }).last().click();
        await expect(page.getByText("Audit log deleted")).toBeVisible({ timeout: 15000 });
    });
});
