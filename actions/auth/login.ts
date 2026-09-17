"use client";

import { authClient } from "@/lib/auth-client";
import { type StaffLoginInput, staffLoginSchema, type TeamLoginInput, teamLoginSchema } from "@/lib/contracts/auth";
import { checkTeamAccess } from "./team-access";

type StaffLoginOptions = Parameters<typeof authClient.signIn.email>[1];

export async function loginAsTeam(input: TeamLoginInput): Promise<{ error: string } | undefined> {
    const parsed = teamLoginSchema.safeParse(input);
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid login" };
    }

    let result: { error?: { message?: string } | null } | undefined;
    try {
        result = await authClient.signIn.username(parsed.data);
    } catch {
        return { error: "Unable to sign in. Please try again." };
    }

    if (result?.error) {
        return { error: result.error.message ?? "Unable to sign in" };
    }

    const access = await checkTeamAccess();
    if (!access.approved) {
        await authClient.signOut();
        return { error: access.message ?? "Your team does not have access." };
    }
}

export function loginAsStaff(input: StaffLoginInput, options?: StaffLoginOptions) {
    const parsed = staffLoginSchema.safeParse(input);
    if (!parsed.success) {
        return Promise.resolve({ error: parsed.error.issues[0]?.message ?? "Invalid login" });
    }

    return authClient.signIn.email(parsed.data, options);
}
