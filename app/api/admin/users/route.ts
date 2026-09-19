import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { listUsersSchema } from "@/lib/contracts/users";
import { listUsers } from "@/lib/data/users";

export async function GET(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const url = new URL(request.url);
    const parsed = listUsersSchema.safeParse({
        page: url.searchParams.get("page") ?? undefined,
        pageSize: url.searchParams.get("pageSize") ?? undefined,
        search: url.searchParams.get("search") ?? undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    return NextResponse.json(await listUsers(parsed.data));
}
