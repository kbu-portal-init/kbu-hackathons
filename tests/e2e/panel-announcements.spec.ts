import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function loginAsOrganizer(page: import("@playwright/test").Page) {
    await page.goto("/login");
    await page.getByRole("button", { name: "Organizer" }).click();
    await page.fill('[name="email"]', "organizer@ms.kbu.ac.th");
    await page.fill('[name="password"]', "organizerpassword");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/panel", { timeout: 15000 });
}

async function createAnnouncement(page: import("@playwright/test").Page, title: string) {
    await page.getByRole("button", { name: "Create announcement" }).click();
    await page.fill("#announcement-title", title);
    await page.fill("#announcement-content", "E2E test content for announcement lifecycle.");
    await page.getByRole("button", { name: "Create announcement" }).last().click();
    await expect(page.getByText("Announcement created")).toBeVisible({ timeout: 10000 });
}

test.describe("panel announcements CRUD", () => {
    test("list announcements with status filters", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/announcements");
        await expect(page.getByRole("button", { name: "All" })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole("button", { name: "Draft" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Published" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Archived" })).toBeVisible();
    });

    test("create announcement shows success toast", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/announcements");
        await createAnnouncement(page, `E2E Draft ${Date.now()}`);
    });

    test("publish draft announcement", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/announcements");
        const ts = Date.now();
        await createAnnouncement(page, `E2E Publish ${ts}`);

        const row = page.getByRole("row").filter({ hasText: `E2E Publish ${ts}` });
        await row.getByRole("button", { name: "Publish" }).click();
        await expect(page.getByText("Announcement published")).toBeVisible({ timeout: 10000 });
    });

    test("archive published announcement", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/announcements");
        const ts = Date.now();
        await createAnnouncement(page, `E2E Archive ${ts}`);

        const row = page.getByRole("row").filter({ hasText: `E2E Archive ${ts}` });
        await row.getByRole("button", { name: "Publish" }).click();
        await expect(page.getByText("Announcement published")).toBeVisible({ timeout: 10000 });

        const publishedRow = page.getByRole("row").filter({ hasText: `E2E Archive ${ts}` });
        await publishedRow.getByRole("button", { name: "Archive" }).first().click();
        await page.getByRole("button", { name: "Archive" }).last().click();
        await expect(page.getByText("Announcement archived")).toBeVisible({ timeout: 10000 });
    });

    test("delete draft announcement", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/announcements");
        const ts = Date.now();
        await createAnnouncement(page, `E2E Delete ${ts}`);

        const row = page.getByRole("row").filter({ hasText: `E2E Delete ${ts}` });
        await row.getByRole("button", { name: "Delete" }).first().click();
        await page.getByRole("button", { name: "Delete" }).last().click();
        await expect(page.getByText("Announcement deleted")).toBeVisible({ timeout: 10000 });
    });

    test("update announcement content", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/announcements");
        const ts = Date.now();
        const title = `E2E Edit ${ts}`;
        await createAnnouncement(page, title);

        const row = page.getByRole("row").filter({ hasText: title });
        await row.getByRole("button", { name: "Edit" }).click();

        await page.fill("#announcement-title", `${title} Updated`);
        await page.fill("#announcement-content", "Updated content from e2e test.");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(page.getByText("Announcement updated")).toBeVisible({ timeout: 10000 });
    });
});
