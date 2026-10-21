import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 2,
    webServer: {
        command: "pnpm dev",
        port: 3000,
        reuseExistingServer: !process.env.CI,
        commandEnv: {
            NODE_ENV: "test",
        },
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
