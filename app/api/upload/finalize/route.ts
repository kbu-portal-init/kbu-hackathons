import { type NextRequest, NextResponse } from "next/server";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { finalizeSchema } from "@/lib/contracts/storage";
import { verifyUpload } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

export async function POST(request: NextRequest) {
    try {
        await requireApprovedTeam();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = finalizeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 },
        );
    }

    const result = await verifyUpload(parsed.data);

    if (!result.ok) {
        return NextResponse.json({ error: result.error.message }, { status: 404 });
    }

    return NextResponse.json(result.data);
}
