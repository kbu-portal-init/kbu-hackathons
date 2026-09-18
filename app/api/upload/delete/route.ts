import { type NextRequest, NextResponse } from "next/server";
import { requireApprovedTeam, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { deleteObjectSchema } from "@/lib/contracts/storage";
import { deleteObject } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

async function getUploadOwner(key: string) {
    try {
        if (key.startsWith("uploads/events/")) {
            await requireOrganizerOrAdmin();
            return "events";
        }
        return (await requireApprovedTeam()).team.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const parsed = deleteObjectSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 },
        );
    }

    const owner = await getUploadOwner(parsed.data.key);
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await deleteObject(parsed.data, owner);

    if (!result.ok) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
}
