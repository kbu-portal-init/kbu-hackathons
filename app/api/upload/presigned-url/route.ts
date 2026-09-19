import { type NextRequest, NextResponse } from "next/server";
import { requireApprovedTeam, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { presignedUrlSchema } from "@/lib/contracts/storage";
import { generatePresignedUploadUrl } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

async function getUploadOwner(category: "image" | "submission" | "event-image") {
    try {
        if (category === "event-image") {
            await requireOrganizerOrAdmin();
            return "events";
        }
        const session = await requireApprovedTeam();
        return session.team.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const parsed = presignedUrlSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 },
        );
    }

    const owner = await getUploadOwner(parsed.data.category);
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await generatePresignedUploadUrl(parsed.data, owner);

    if (!result.ok) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
}
