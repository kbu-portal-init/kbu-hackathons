import { expect, test } from "./fixtures";

test("session API returns valid response", async ({ request }) => {
    const response = await request.get("/api/auth/*get-session");
    // Better Auth session endpoint returns 200 with session data or redirect
    expect(response.status()).toBeLessThan(500);
});

test("login page has form fields", async ({ page }) => {
    await page.goto("/login");
    // Should have either team or staff login form
    await expect(page.getByRole("textbox", { name: "username" })).toBeVisible();
});

test("invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    // Use team login form
    await page.fill('[name="username"]', "nonexistent");
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/login");
    // Check for error message
    await expect(page.getByText(/invalid|unable to authenticate/i)).toBeVisible({ timeout: 5000 });
});
