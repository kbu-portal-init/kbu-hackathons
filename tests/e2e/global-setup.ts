import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path: string): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        vars[key] = value;
    }
    return vars;
}

export function loadE2eEnv(): void {
    const envPath = resolve(__dirname, "../../.env.e2e");
    if (!existsSync(envPath)) {
        throw new Error("Missing .env.e2e — copy .env.e2e.example to .env.e2e and fill in your test database URL.");
    }

    const env = loadEnvFile(envPath);
    for (const [key, value] of Object.entries(env)) {
        (process.env as Record<string, string | undefined>)[key] = value;
    }

    if (!process.env.DATABASE_URL) {
        throw new Error(".env.e2e must set DATABASE_URL to a dedicated test database.");
    }
}

export default function globalSetup(): void {
    loadE2eEnv();
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";

    if (process.env.E2E_SKIP_MIGRATE !== "1") {
        console.log("[global-setup] Applying database migrations...");
        execSync("pnpm db:migrate:deploy", {
            env: process.env,
            stdio: "inherit",
            cwd: resolve(__dirname, "../.."),
        });
        console.log("[global-setup] Migrations applied.");
    } else {
        console.log("[global-setup] E2E_SKIP_MIGRATE=1 — skipping migrations.");
    }

    if (process.env.E2E_SKIP_SEED === "1") {
        console.log("[global-setup] E2E_SKIP_SEED=1 — skipping database seed.");
        return;
    }

    console.log("[global-setup] Seeding test database...");
    execSync("pnpm db:seed", {
        env: process.env,
        stdio: "inherit",
        cwd: resolve(__dirname, "../.."),
    });
    console.log("[global-setup] Seed complete.");
}
