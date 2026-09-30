import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { mockModule as mock } from "@/tests/helpers/mocks";

let signInResult: unknown = { data: null };
let signInThrow = false;
let hintWrites: string[] = [];

const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;

mock("@/lib/auth-client", {
    authClient: {
        signIn: {
            username: async (data: unknown) => {
                if (signInThrow) throw new Error("network");
                lastSignIn = { method: "username", data };
                return signInResult;
            },
            email: async (data: unknown) => {
                if (signInThrow) throw new Error("network");
                lastSignIn = { method: "email", data };
                return signInResult;
            },
        },
    },
});

let lastSignIn: { method: string; data: unknown } | undefined;
let cookieValue = "";

Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
        get cookie() {
            return cookieValue;
        },
        set cookie(value: string) {
            hintWrites.push(value);
            cookieValue = value;
        },
    },
});

let loginAsTeam: typeof import("@/lib/auth/login-client").loginAsTeam;
let loginAsStaff: typeof import("@/lib/auth/login-client").loginAsStaff;
let sessionHint: typeof import("@/lib/auth/session-hint");

before(async () => {
    ({ loginAsTeam, loginAsStaff } = await import("@/lib/auth/login-client"));
    sessionHint = await import("@/lib/auth/session-hint");
});

beforeEach(() => {
    signInResult = { data: null };
    signInThrow = false;
    lastSignIn = undefined;
    hintWrites = [];
    cookieValue = "";
});

describe("staff and team login client", () => {
    it("rejects invalid credentials before calling the auth client", async () => {
        const result = await loginAsTeam({ username: " ", password: "short" });
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "VALIDATION_ERROR");
        assert.equal(lastSignIn, undefined);

        const staff = await loginAsStaff({ email: "not-an-email", password: "short" });
        assert.equal(staff.ok, false);
        if (!staff.ok) assert.equal(staff.error.code, "VALIDATION_ERROR");
        assert.equal(lastSignIn, undefined);
    });

    it("maps provider error payloads to authentication failures", async () => {
        signInResult = { error: { message: "Invalid credentials" } };
        const result = await loginAsTeam({ username: "team-alpha", password: "password1" });
        assert.equal(result.ok, false);
        if (!result.ok) {
            assert.equal(result.error.code, "AUTHENTICATION_FAILED");
            assert.equal(result.error.message, "Invalid credentials");
        }
        assert.equal(hintWrites.length, 0);
    });

    it("treats thrown network errors as authentication failures", async () => {
        signInThrow = true;
        const result = await loginAsStaff({ email: "staff@example.com", password: "password1" });
        assert.equal(result.ok, false);
        if (!result.ok) assert.equal(result.error.code, "AUTHENTICATION_FAILED");
        assert.equal(hintWrites.length, 0);
    });

    it("sets the session hint on successful sign-in", async () => {
        signInResult = { data: { session: { token: "t" } } };
        const result = await loginAsStaff({ email: "staff@example.com", password: "password1" });
        assert.deepEqual(result, { ok: true, data: { authenticated: true } });
        assert.deepEqual(lastSignIn, {
            method: "email",
            data: { email: "staff@example.com", password: "password1" },
        });
        assert.equal(hintWrites.length, 1);
        assert.ok(hintWrites[0]?.startsWith(`${sessionHint.SESSION_HINT_COOKIE}=1`));
        assert.equal(sessionHint.hasSessionHint(), true);
    });
});

describe("session hint cookie", () => {
    it("sets, detects, and expires the hint cookie", () => {
        assert.equal(sessionHint.hasSessionHint(), false);

        sessionHint.setSessionHint();
        assert.equal(sessionHint.hasSessionHint(), true);
        assert.match(hintWrites.at(-1) ?? "", /Max-Age=604800/);

        sessionHint.clearSessionHint();
        assert.equal(sessionHint.hasSessionHint(), false);
        assert.match(hintWrites.at(-1) ?? "", /Max-Age=0/);
    });
});
