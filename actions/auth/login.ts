"use client";

import { authClient } from "@/lib/auth-client";
import { type StaffLoginInput, staffLoginSchema, type TeamLoginInput, teamLoginSchema } from "@/lib/contracts/auth";

type TeamLoginOptions = Parameters<typeof authClient.signIn.username>[1];
type StaffLoginOptions = Parameters<typeof authClient.signIn.email>[1];

export function loginAsTeam(input: TeamLoginInput, options?: TeamLoginOptions) {
    const parsed = teamLoginSchema.safeParse(input);
    if (!parsed.success) {
        return Promise.resolve({ error: parsed.error.issues[0]?.message ?? "Invalid login" });
    }

    return authClient.signIn.username(parsed.data, options);
}

export function loginAsStaff(input: StaffLoginInput, options?: StaffLoginOptions) {
    const parsed = staffLoginSchema.safeParse(input);
    if (!parsed.success) {
        return Promise.resolve({ error: parsed.error.issues[0]?.message ?? "Invalid login" });
    }

    return authClient.signIn.email(parsed.data, options);
}
