import { NextResponse } from "next/server";
import { z } from "zod";
import { isNotificationDeliveryError } from "@/lib/services/notifications";
import { requestPasswordReset } from "@/lib/services/password-reset-request";
import { checkPasswordResetRateLimit } from "@/lib/services/rate-limit";

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
        const identifier = parsed.data.email ?? parsed.data.username ?? "";
        const rateLimit = await checkPasswordResetRateLimit(identifier, request);
        if (!rateLimit.success) {
            return NextResponse.json(
                { message: "Too many password-reset requests. Please try again later." },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
            );
        }

        const result = await requestPasswordReset(parsed.data);
        if (!result.found || !result.sent) {
            return NextResponse.json({
                message:
                    "Check your inbox for password reset instructions. If you do not see an email, check your spam folder.",
            });
        }
        return NextResponse.json({
            message:
                "Check your inbox for password reset instructions. If you do not see an email, check your spam folder.",
        });
    } catch (error) {
        if (isNotificationDeliveryError(error)) {
            return NextResponse.json({ message: "Unable to deliver password-reset email" }, { status: 503 });
        }
        return NextResponse.json({ message: "Unable to prepare password-reset email" }, { status: 500 });
    }
}
