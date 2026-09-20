import "server-only";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageResponse } from "next/og";
import type { ActionResult } from "@/lib/contracts/common";
import type { GenerateMemberCardData, GenerateMemberCardInput } from "@/lib/contracts/team-members";
import prisma from "@/lib/prisma";
import { isR2Configured, R2_BUCKET, R2_PUBLIC_URL, r2 } from "@/lib/r2";
import { formatRole } from "@/lib/util";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const CARD_EVENT_NAME = "KBU Hackathon 2026";

function formatEventDateRange(startsAt: Date, endsAt: Date): string {
    const format = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
    return `${format.format(startsAt)} - ${format.format(endsAt)}`;
}

async function renderMemberCard(
    teamName: string,
    memberName: string,
    role: string,
    eventDateRange: string,
): Promise<Buffer> {
    const response = new ImageResponse(
        <div
            style={{
                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 45%, #c2410c 100%)",
                color: "#431407",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
                padding: "72px",
                width: "100%",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>{CARD_EVENT_NAME}</div>
                <div style={{ color: "#9a3412", display: "flex", fontSize: 24 }}>{eventDateRange}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ color: "#9a3412", display: "flex", fontSize: 28 }}>{teamName}</div>
                <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>{memberName}</div>
                <div style={{ color: "#7c2d12", display: "flex", fontSize: 36 }}>{formatRole(role)}</div>
            </div>
            <div style={{ color: "#7c2d12", display: "flex", fontSize: 28, fontWeight: 700 }}>
                Build. Connect. Compete.
            </div>
        </div>,
        { width: CARD_WIDTH, height: CARD_HEIGHT },
    );

    return Buffer.from(await response.arrayBuffer());
}

export async function generateMemberCard(
    teamId: string,
    input: GenerateMemberCardInput,
): Promise<ActionResult<GenerateMemberCardData>> {
    if (!isR2Configured() || !r2 || !R2_BUCKET || !R2_PUBLIC_URL) {
        return { ok: false, error: { code: "STORAGE_NOT_CONFIGURED", message: "Storage is not configured" } };
    }

    const member = await prisma.teamMember.findFirst({
        where: { id: input.memberId, teamId },
        select: {
            id: true,
            name: true,
            role: true,
            cardKey: true,
            team: { select: { displayName: true } },
        },
    });

    if (!member) {
        return { ok: false, error: { code: "MEMBER_NOT_FOUND", message: "Team member not found" } };
    }

    const event = await prisma.eventSettings.findUnique({
        where: { id: 1 },
        select: { startsAt: true, endsAt: true },
    });
    const eventDateRange = event ? formatEventDateRange(event.startsAt, event.endsAt) : "Nov 9 - Nov 10";

    let uploadedKey: string | null = null;
    try {
        const buffer = await renderMemberCard(member.team.displayName, member.name, member.role, eventDateRange);
        const key = `uploads/${teamId}/cards/${member.id}-${crypto.randomUUID()}.png`;
        const cardShareToken = crypto.randomUUID();
        uploadedKey = key;
        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: "image/png",
                ContentLength: buffer.length,
            }),
        );

        const cardUrl = `${R2_PUBLIC_URL}/${key}`;
        await prisma.teamMember.update({
            where: { id: member.id },
            data: { cardKey: key, cardUrl, cardShareToken },
        });

        if (member.cardKey && member.cardKey !== key) {
            await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: member.cardKey }));
        }

        return { ok: true, data: { id: member.id, cardUrl } };
    } catch {
        if (uploadedKey) {
            try {
                await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: uploadedKey }));
            } catch {
                // Preserve the original generation failure if cleanup also fails.
            }
        }
        return { ok: false, error: { code: "CARD_GENERATION_FAILED", message: "Failed to generate member card" } };
    }
}
