import type { NextRequest } from "next/server";
import { archiveAnnouncement } from "@/actions/management/announcements";
import { actionResultResponse } from "@/lib/api/response";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function POST(_request: NextRequest, { params }: RouteContext) {
    const { id } = await params;

    const result = await archiveAnnouncement({
        announcementId: id,
    });

    return actionResultResponse(result);
}
