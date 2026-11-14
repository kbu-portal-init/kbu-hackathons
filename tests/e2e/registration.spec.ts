import { expect, test } from "./fixtures";

async function acknowledge(page: import("@playwright/test").Page) {
    await page.getByRole("button", { name: "Read before submitting" }).click();
    await page.locator("#registration-acknowledgment").check();
    await page.getByRole("button", { name: "I understand" }).click();
}

test.describe("registration form", () => {
    test("renders all sections", async ({ page }) => {
        await page.goto("/register");
        await expect(page.locator("#teamName")).toBeVisible();
        await expect(page.locator("#leaderName")).toBeVisible();
        await expect(page.locator("#leaderEmail")).toBeVisible();
        await expect(page.getByRole("radiogroup")).toBeVisible();
        await expect(page.locator('[name="members.0.name"]')).toBeVisible();
        await expect(page.locator('[name="members.0.email"]')).toBeVisible();
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
        await page.fill('[name="members.0.name"]', "E2E Member");
        await page.fill('[name="members.0.email"]', `u${ts}b@ms.kbu.ac.th`);

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
        await page.fill('[name="members.0.name"]', "Dup Member");
        await page.fill('[name="members.0.email"]', `u${ts}x@ms.kbu.ac.th`);

        await acknowledge(page);
        await page.getByRole("button", { name: "Submit registration" }).click();

        await expect(page.getByText(/already exists/i).first()).toBeVisible({ timeout: 15000 });
    });

    test("network failure during submission shows an error and allows retry", async ({ page }) => {
        await page.goto("/register");

        const ts = Date.now();
        const teamName = `E2E Network Failure ${ts}`;

        await page.fill("#teamName", teamName);
        await page.locator('input[type="radio"][value="THAI_PROGRAM"]').check({ force: true });
        await page.fill("#leaderName", "E2E Leader");
        await page.fill("#leaderEmail", `u${ts}a@ms.kbu.ac.th`);
        await page.fill('[name="members.0.name"]', "E2E Member");
        await page.fill('[name="members.0.email"]', `u${ts}b@ms.kbu.ac.th`);

        await acknowledge(page);

        let requestAborted = false;

        await page.route("**/register", async (route) => {
            if (route.request().method() === "POST") {
                requestAborted = true;
                await route.abort("failed");
                return;
            }

            await route.continue();
        });

        await page.getByRole("button", { name: "Submit registration" }).click();

        await expect(page.getByText("Unable to submit your registration. Please try again.")).toBeVisible({
            timeout: 10000,
        });

        expect(requestAborted).toBe(true);
        await expect(page.locator("#teamName")).toHaveValue(teamName);
        await expect(page.getByRole("button", { name: "Submit registration" })).toBeEnabled();
    });
});
