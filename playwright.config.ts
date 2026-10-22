import { defineConfig, devices } from "@playwright/test";
import { loadE2eEnv } from "./tests/e2e/global-setup";

// webServer spawns before globalSetup, so .env.e2e must load here or `pnpm dev` uses the dev database.
loadE2eEnv();

export default defineConfig({
    testDir: "./tests/e2e",
    globalSetup: "./tests/e2e/global-setup.ts",
    timeout: 60000,
    expect: {
        timeout: 10000,
    },
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    webServer: {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 120000,
    },
    use: {
        baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
        headless: !process.env.PLAYWRIGHT_HEADED,
    },
    projects: [
        {
            name: "Chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
