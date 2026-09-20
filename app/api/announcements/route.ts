import type { NextRequest } from "next/server";
import { listPublishedAnnouncements } from "@/actions/management/announcements";
import { actionResultResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const result = await listPublishedAnnouncements({
        page: searchParams.get("page") ?? undefined,
        pageSize: searchParams.get("pageSize") ?? undefined,
        search: searchParams.get("search") ?? undefined,
    });

    return actionResultResponse(result);
}
