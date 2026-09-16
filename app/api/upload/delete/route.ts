import { type NextRequest, NextResponse } from "next/server";
import { requireApprovedTeam } from "@/lib/auth/guards";
import { deleteObjectSchema } from "@/lib/contracts/storage";
import { deleteObject } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

export async function POST(request: NextRequest) {
    try {
        await requireApprovedTeam();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = deleteObjectSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 },
        );
    }

    const result = await deleteObject(parsed.data);

    if (!result.ok) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
}
