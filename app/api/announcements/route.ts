import type { NextRequest } from "next/server";
import { createAnnouncement, listPublishedAnnouncements } from "@/actions/management/announcements";
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await createAnnouncement(body);

        return actionResultResponse(result, 201);
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
