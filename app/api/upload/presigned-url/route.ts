import { type NextRequest, NextResponse } from "next/server";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { presignedUrlSchema } from "@/lib/contracts/storage";
import { generatePresignedUploadUrl } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

export async function POST(request: NextRequest) {
    try {
        await requireApprovedTeam();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = presignedUrlSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 },
        );
    }

    const result = await generatePresignedUploadUrl(parsed.data);

    if (!result.ok) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
}
