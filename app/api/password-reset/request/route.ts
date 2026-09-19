import { NextResponse } from "next/server";
import { z } from "zod";
import { isNotificationDeliveryError } from "@/lib/services/notifications";
import { requestPasswordReset } from "@/lib/services/password-reset-request";

const requestSchema = z
    .object({
        email: z.email().optional(),
        username: z.string().trim().min(1).optional(),
    })
    .refine((value) => Boolean(value.email) !== Boolean(value.username), "Provide an email or team username");

export async function POST(request: Request) {
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Invalid password-reset request" }, { status: 400 });

    try {
        const result = await requestPasswordReset(parsed.data);
        if (!result.found) return NextResponse.json({ message: "If the account exists, check the email inbox" });
        if (!result.sent)
            return NextResponse.json({ message: "No verified leader email is available" }, { status: 409 });
        return NextResponse.json({ message: "Password-reset email sent" });
    } catch (error) {
        if (isNotificationDeliveryError(error)) {
            return NextResponse.json({ message: "Unable to deliver password-reset email" }, { status: 503 });
        }
        return NextResponse.json({ message: "Unable to prepare password-reset email" }, { status: 500 });
    }
}
