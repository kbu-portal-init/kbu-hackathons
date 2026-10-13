import type { NextRequest } from "next/server";
import { listPublishedAnnouncements } from "@/actions/management/announcements";
import { actionResultResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get("category");

    const categoryMap = {
        important: "IMPORTANT",
        update: "UPDATES",
        news: "NEWS",
    } as const;

    const category =
        categoryParam && categoryParam in categoryMap
            ? categoryMap[categoryParam as keyof typeof categoryMap]
            : undefined;

    const result = await listPublishedAnnouncements({
        page: searchParams.get("page") ?? undefined,
        pageSize: searchParams.get("pageSize") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        ...(category ? { category } : {}),
    });

    return actionResultResponse(result);
}
