import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// webServer spawns before globalSetup, so load the test environment during config evaluation.
dotenv.config({ path: resolve(__dirname, ".env.e2e"), override: true });
process.env.NODE_ENV = "test";

if (!process.env.DATABASE_URL) {
    throw new Error(".env.e2e must set DATABASE_URL to a dedicated test database.");
}

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
        env: process.env,
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
