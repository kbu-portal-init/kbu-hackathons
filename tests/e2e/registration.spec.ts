import { expect, test } from "@playwright/test";

async function acknowledge(page: import("@playwright/test").Page) {
    await page.getByRole("button", { name: "Read before submitting" }).click();
    await page.locator("#registration-acknowledgment").check();
    await page.getByRole("button", { name: "I understand" }).click();
}

function uniqueEmail() {
    return `u${Date.now()}${Math.floor(Math.random() * 1000)}@ms.kbu.ac.th`;
}

test.describe("registration form", () => {
    test("renders all sections", async ({ page }) => {
        await page.goto("/register");
        await expect(page.locator("#teamName")).toBeVisible();
        await expect(page.locator("#leaderName")).toBeVisible();
        await expect(page.locator("#leaderEmail")).toBeVisible();
        await expect(page.getByRole("radiogroup")).toBeVisible();
        await expect(page.locator("#members\\.0\\.name")).toBeVisible();
        await expect(page.locator("#members\\.0\\.email")).toBeVisible();
    });

    test("empty submit after acknowledge shows validation errors", async ({ page }) => {
        await page.goto("/register");
        await acknowledge(page);
        await page.getByRole("button", { name: "Submit registration" }).click();
        await expect(page.getByText(/at least 2 characters|Invalid email|required/i).first()).toBeVisible({
            timeout: 10000,
        });
    });

    test("successful registration submits and shows confirmation", async ({ page }) => {
        await page.goto("/register");
        const ts = Date.now();
        await page.fill("#teamName", `E2E Team ${ts}`);
        await page.locator('input[type="radio"][value="THAI_PROGRAM"]').check({ force: true });
        await page.fill("#leaderName", "E2E Leader");
        await page.fill("#leaderEmail", `u${ts}a@ms.kbu.ac.th`);
        await page.fill("#members\\.0\\.name", "E2E Member");
        await page.fill("#members\\.0\\.email", `u${ts}b@ms.kbu.ac.th`);

        await acknowledge(page);
        await page.getByRole("button", { name: "Submit registration" }).click();

        await expect(page.getByRole("heading", { name: "Registration submitted!" })).toBeVisible({
            timeout: 20000,
        });
    });

    test("duplicate student email returns server error", async ({ page }) => {
        await page.goto("/register");
        const ts = Date.now();
        await page.fill("#teamName", `E2E Dup ${ts}`);
        await page.locator('input[type="radio"][value="THAI_PROGRAM"]').check({ force: true });
        await page.fill("#leaderName", "Dup Leader");
        await page.fill("#leaderEmail", "u660000000001@ms.kbu.ac.th");
        await page.fill("#members\\.0\\.name", "Dup Member");
        await page.fill("#members\\.0\\.email", `u${ts}x@ms.kbu.ac.th`);

        await acknowledge(page);
        await page.getByRole("button", { name: "Submit registration" }).click();

        await expect(page.getByText(/already exists/i).first()).toBeVisible({ timeout: 15000 });
    });
});
