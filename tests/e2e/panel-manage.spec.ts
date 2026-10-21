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

async function createPendingRegistration(page: import("@playwright/test").Page): Promise<string> {
    const ts = Date.now();
    const teamName = `E2E Mgmt ${ts}`;
    await page.goto("/register");
    await page.fill("#teamName", teamName);
    await page.locator('input[type="radio"][value="THAI_PROGRAM"]').check({ force: true });
    await page.fill("#leaderName", "Mgmt Leader");
    await page.fill("#leaderEmail", `u${ts}m@ms.kbu.ac.th`);
    await page.fill("#members\\.0\\.name", "Mgmt Member");
    await page.fill("#members\\.0\\.email", `u${ts}n@ms.kbu.ac.th`);

    await page.getByRole("button", { name: "Read before submitting" }).click();
    await page.locator("#registration-acknowledgment").check();
    await page.getByRole("button", { name: "I understand" }).click();
    await page.getByRole("button", { name: "Submit registration" }).click();
    await expect(page.getByRole("heading", { name: "Registration submitted!" })).toBeVisible({
        timeout: 20000,
    });
    return teamName;
}

test.describe("organizer management actions", () => {
    test("upsert event settings saves changes", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/event");
        await expect(page.locator("#title")).toBeVisible({ timeout: 10000 });

        await page.fill("#title", "KBU Hackathon 2026 E2E");
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(page.getByText(/Event settings (updated|created)/)).toBeVisible({ timeout: 15000 });
    });

    test("list registration requests with filters", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/registrations");
        await expect(page.getByRole("button", { name: "All" })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole("button", { name: "Pending" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Approved" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Rejected" })).toBeVisible();
    });

    test("manually verify member email and resend verification", async ({ page }) => {
        await loginAsOrganizer(page);

        // Create a fresh pending registration to work with
        const teamName = await createPendingRegistration(page);

        await page.goto("/panel/registrations?status=PENDING");
        const row = page.getByRole("row").filter({ hasText: teamName });
        await row.getByRole("button", { name: "View" }).click();
        await page.waitForURL(/\/panel\/registrations\/.*/, { timeout: 10000 });

        // Resend verification → toast
        const resendBtn = page.getByRole("button", { name: "Resend" }).first();
        if (await resendBtn.isVisible().catch(() => false)) {
            await resendBtn.click();
            await expect(page.getByText("Verification email sent")).toBeVisible({ timeout: 10000 });
        }

        // Manually verify first unverified member → toast
        const verifyBtn = page.getByRole("button", { name: "Manually Verify" }).first();
        await expect(verifyBtn).toBeVisible({ timeout: 10000 });
        await verifyBtn.click();
        await expect(page.getByText("Email manually verified")).toBeVisible({ timeout: 10000 });
    });

    test("reject registration with reason", async ({ page }) => {
        await loginAsOrganizer(page);
        const teamName = await createPendingRegistration(page);

        await page.goto("/panel/registrations?status=PENDING");
        const row = page.getByRole("row").filter({ hasText: teamName });
        await row.getByRole("button", { name: "Reject" }).click();

        await page.fill("#reason", "E2E test rejection reason.");
        await page.getByRole("button", { name: "Reject registration" }).last().click();
        await expect(page.getByText("Registration rejected")).toBeVisible({ timeout: 15000 });
    });

    test("approve registration after verifying all members", async ({ page }) => {
        await loginAsOrganizer(page);
        const teamName = await createPendingRegistration(page);

        await page.goto("/panel/registrations?status=PENDING");
        const row = page.getByRole("row").filter({ hasText: teamName });
        await row.getByRole("button", { name: "View" }).click();
        await page.waitForURL(/\/panel\/registrations\/.*/, { timeout: 10000 });

        // Verify all unverified members (loop until no more "Manually Verify" buttons)
        for (let i = 0; i < 10; i++) {
            const btn = page.getByRole("button", { name: "Manually Verify" }).first();
            if (!(await btn.isVisible().catch(() => false))) break;
            await btn.click();
            await expect(page.getByText("Email manually verified")).toBeVisible({ timeout: 10000 });
        }

        // Approve
        const approveBtn = page.getByRole("button", { name: "Approve registration" });
        await expect(approveBtn).toBeEnabled({ timeout: 10000 });
        await approveBtn.click();
        await expect(page.getByText(/Registration approved/i)).toBeVisible({ timeout: 15000 });
    });

    test("list teams and view team detail", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/teams");
        await expect(page.getByRole("button", { name: "All" })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole("button", { name: "Active" })).toBeVisible();

        const row = page.getByRole("row").filter({ hasText: "Team Orbit" });
        await row.getByRole("link", { name: "View" }).click();
        await page.waitForURL(/\/panel\/teams\/.*/, { timeout: 10000 });
    });

    test("ban and unban a team", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/teams");

        // Ban team-orbit
        const banRow = page.getByRole("row").filter({ hasText: "Team Orbit" });
        await banRow.getByRole("button", { name: "Ban" }).click();
        await page.locator('input[id^="ban-reason-"]').fill("E2E test ban reason.");
        await page.getByRole("button", { name: "Confirm ban" }).click();
        await expect(page.getByText("Team banned")).toBeVisible({ timeout: 15000 });

        // Unban team-orbit
        await page.goto("/panel/teams?status=BANNED");
        const unbanRow = page.getByRole("row").filter({ hasText: "Team Orbit" });
        await unbanRow.getByRole("button", { name: "Unban" }).first().click();
        await page.getByRole("button", { name: "Unban" }).last().click();
        await expect(page.getByText("Team unbanned")).toBeVisible({ timeout: 15000 });
    });

    test("reopen team submission", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/teams");
        const row = page.getByRole("row").filter({ hasText: "Team Orbit" });
        await row.getByRole("link", { name: "View" }).click();
        await page.waitForURL(/\/panel\/teams\/.*/, { timeout: 10000 });

        // Team-orbit has a submitted submission in seed
        const reopenBtn = page.getByRole("button", { name: "Reopen for editing" });
        if (await reopenBtn.isVisible().catch(() => false)) {
            await reopenBtn.click();
            await page.getByRole("button", { name: "Reopen submission" }).last().click();
            // Page should refresh; assert no crash
            await expect(page.locator("body")).not.toContainText("Application error");
        }
    });

    test("send in-app notification to a team", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/notifications");

        // Select recipient mode: Specific team
        const recipientTrigger = page.getByRole("button", { name: /specific team/i }).first();
        await recipientTrigger.click();
        await page.getByRole("option", { name: /specific team/i }).click();

        // Choose team-orbit from team select
        const teamTrigger = page.getByRole("button", { name: /choose a team/i }).first();
        await teamTrigger.click();
        await page.getByRole("option", { name: /team orbit/i }).click();

        // Select channel: In-app only
        const channelTrigger = page.getByRole("button", { name: /email and in-app/i }).first();
        await channelTrigger.click();
        await page.getByRole("option", { name: /in-app only/i }).click();

        await page.fill("#notification-subject", "E2E Test Notification");
        await page.fill("#notification-body", "This is an e2e test in-app notification.");
        await page.getByRole("button", { name: "Send notification" }).click();

        await expect(page.locator('[role="status"]')).toContainText(/in-app/i, { timeout: 15000 });
    });

    test("update organizer profile", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/settings");
        await expect(page.locator("#organizer-name")).toBeVisible({ timeout: 10000 });

        await page.fill("#organizer-name", "E2E Organizer");
        await page.getByRole("button", { name: "Save profile" }).click();
        await expect(page.getByText("Profile updated")).toBeVisible({ timeout: 10000 });

        // Revert name
        await page.fill("#organizer-name", "Primary Organizer");
        await page.getByRole("button", { name: "Save profile" }).click();
        await expect(page.getByText("Profile updated")).toBeVisible({ timeout: 10000 });
    });

    test("change organizer password with validation", async ({ page }) => {
        await loginAsOrganizer(page);
        await page.goto("/panel/settings");

        // Wrong current password → error
        await page.fill("#organizer-current-password", "wrongpassword");
        await page.fill("#organizer-new-password", "newpassword123");
        await page.fill("#organizer-confirm-password", "newpassword123");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText(/incorrect|could not be changed/i).first()).toBeVisible({ timeout: 10000 });

        // Change and revert
        await page.fill("#organizer-current-password", "organizerpassword");
        await page.fill("#organizer-new-password", "organizerpassword1");
        await page.fill("#organizer-confirm-password", "organizerpassword1");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText("Password changed")).toBeVisible({ timeout: 10000 });

        await page.fill("#organizer-current-password", "organizerpassword1");
        await page.fill("#organizer-new-password", "organizerpassword");
        await page.fill("#organizer-confirm-password", "organizerpassword");
        await page.getByRole("button", { name: "Change password" }).click();
        await expect(page.getByText("Password changed")).toBeVisible({ timeout: 10000 });
    });
});
