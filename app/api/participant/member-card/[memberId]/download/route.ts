import { GetObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";
import { requireApprovedTeam } from "@/lib/auth/guards";
import prisma from "@/lib/prisma";
import { R2_BUCKET, r2 } from "@/lib/r2";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
    const { team } = await requireApprovedTeam();
    const { memberId } = await params;

    const member = await prisma.teamMember.findFirst({
        where: { id: memberId, teamId: team.id },
        select: { name: true, cardKey: true },
    });

    if (!member?.cardKey || !r2 || !R2_BUCKET) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const object = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: member.cardKey }));
    if (!object.Body) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    const body = await object.Body.transformToByteArray();
    const filename = `${
        member.name
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase() || "member"
    }-card.png`;
    return new NextResponse(Buffer.from(body), {
        headers: {
            "Cache-Control": "private, no-store",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Type": "image/png",
        },
    });
}
