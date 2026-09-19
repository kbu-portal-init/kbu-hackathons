import type { NextRequest } from "next/server";
import { deleteAnnouncement, getAnnouncement, updateAnnouncement } from "@/actions/management/announcements";
import { actionResultResponse } from "@/lib/api/response";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
    const { id } = await params;

    const result = await getAnnouncement({
        announcementId: id,
    });

    return actionResultResponse(result);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
    const { id } = await params;

    try {
        const body = await request.json();

        const result = await updateAnnouncement({
            ...body,
            announcementId: id,
        });

        return actionResultResponse(result);
    } catch {
        return actionResultResponse({
            ok: false,
            error: {
                code: "INVALID_JSON",
                message: "Invalid JSON body",
            },
        });
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
    const { id } = await params;

    const result = await deleteAnnouncement({
        announcementId: id,
    });

    return actionResultResponse(result);
}
