import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireApprovedTeam, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { deleteObjectSchema } from "@/lib/contracts/storage";
import prisma from "@/lib/prisma";
import { deleteObject } from "@/lib/services/storage";
import { toFieldErrors } from "@/lib/validation/zod";

const deleteRequestSchema = deleteObjectSchema
    .extend({
        teamId: z.string().trim().min(1).optional(),
        memberId: z.string().trim().min(1).optional(),
    })
    .superRefine((data, context) => {
        if (Boolean(data.teamId) !== Boolean(data.memberId)) {
            context.addIssue({
                code: "custom",
                message: "Team ID and member ID must be provided together",
                path: ["teamId"],
            });
        }
    });

async function getUploadOwner(key: string) {
    try {
        if (key.startsWith("uploads/admins/")) {
            return `admins/${(await requireAdmin()).user.id}`;
        }

        if (key.startsWith("uploads/organizers/")) {
            return `organizers/${(await requireOrganizerOrAdmin()).user.id}`;
        }

        if (key.startsWith("uploads/events/")) {
            await requireOrganizerOrAdmin();
            return "events";
        }

        if (key.startsWith("uploads/announcements/")) {
            await requireOrganizerOrAdmin();
            return "announcements";
        }

        return (await requireApprovedTeam()).team.id;
    } catch {
        return null;
    }
}

async function getManagementMemberUploadOwner(teamId: string, memberId: string) {
    try {
        await requireOrganizerOrAdmin();

        const member = await prisma.teamMember.findFirst({
            where: {
                id: memberId,
                teamId,
            },
            select: {
                teamId: true,
            },
        });

        return member?.teamId ?? null;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = deleteRequestSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", fieldErrors: toFieldErrors(parsed.error) },
            { status: 400 },
        );
    }

    const { key, teamId, memberId } = parsed.data;

    let owner: string | null;

    if (teamId && memberId) {
        owner = await getManagementMemberUploadOwner(teamId, memberId);

        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!key.startsWith(`uploads/${owner}/`)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    } else {
        owner = await getUploadOwner(key);

        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const result = await deleteObject({ key }, owner);

    if (!result.ok) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
}
