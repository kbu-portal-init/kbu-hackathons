import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageResponse } from "next/og";
import type { ActionResult } from "@/lib/contracts/common";
import type { GenerateMemberCardData, GenerateMemberCardInput } from "@/lib/contracts/team-members";
import prisma from "@/lib/prisma";
import { isR2Configured, R2_BUCKET, R2_PUBLIC_URL, r2 } from "@/lib/r2";
import { formatRole } from "@/lib/util";

const CARD_WIDTH = 1600;
const CARD_HEIGHT = 960;

async function getReferenceCardDataUrl(): Promise<string> {
    const reference = await readFile(path.join(process.cwd(), "public/images/card-ref.png"));
    return `data:image/png;base64,${reference.toString("base64")}`;
}

async function getEthnocentricFont(): Promise<Buffer> {
    return readFile(path.join(process.cwd(), "public/fonts/Ethnocentric-Regular.otf"));
}

function formatEventDateRange(startsAt: Date, endsAt: Date): string {
    const format = new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
    });
    return `${format.format(startsAt).toUpperCase()} — ${format.format(endsAt).toUpperCase()}`;
}

async function renderMemberCard(
    teamName: string,
    memberName: string,
    role: string,
    eventDateRange: string,
): Promise<Buffer> {
    const referenceDataUrl = await getReferenceCardDataUrl();
    const ethnocentricFont = await getEthnocentricFont();
    const response = new ImageResponse(
        <div
            style={{
                background: "#090909",
                display: "flex",
                height: "100%",
                overflow: "hidden",
                position: "relative",
                width: "100%",
            }}
        >
            {/* biome-ignore lint/performance/noImgElement: ImageResponse requires an embedded background image. */}
            <img
                alt="Participant card reference background"
                height={CARD_HEIGHT}
                src={referenceDataUrl}
                style={{ left: 0, position: "absolute", top: 0 }}
                width={CARD_WIDTH}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: 270,
                    justifyContent: "center",
                    left: 86,
                    position: "absolute",
                    top: 532,
                    width: 980,
                }}
            >
                <div
                    style={{
                        color: "#ff8a00",
                        display: "flex",
                        fontFamily: "Ethnocentric",
                        fontSize: 28,
                        fontWeight: 800,
                        letterSpacing: 2,
                        maxWidth: 980,
                    }}
                >
                    {teamName}
                </div>
                <div
                    style={{
                        color: "#ffffff",
                        display: "flex",
                        fontFamily: "Ethnocentric",
                        fontSize: 68,
                        fontWeight: 800,
                        lineHeight: 1,
                        marginTop: 12,
                        maxWidth: 980,
                        maxHeight: 144,
                        overflow: "hidden",
                    }}
                >
                    {memberName}
                </div>
                <div
                    style={{
                        color: "#ff8a00",
                        display: "flex",
                        fontFamily: "Ethnocentric",
                        fontSize: 32,
                        fontWeight: 700,
                        letterSpacing: 2,
                        marginTop: 14,
                    }}
                >
                    {formatRole(role)}
                </div>
            </div>
            <div
                style={{
                    bottom: 86,
                    color: "#ffffff",
                    display: "flex",
                    fontFamily: "Ethnocentric",
                    fontSize: 24,
                    fontWeight: 700,
                    left: 86,
                    letterSpacing: 2,
                    position: "absolute",
                }}
            >
                {eventDateRange}
            </div>
        </div>,
        {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            fonts: [{ data: ethnocentricFont, name: "Ethnocentric", style: "normal", weight: 400 }],
        },
    );

    return Buffer.from(await response.arrayBuffer());
}

export async function generateMemberCard(
    teamId: string,
    input: GenerateMemberCardInput,
    actorId: string,
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
    if (!event) {
        return { ok: false, error: { code: "EVENT_NOT_CONFIGURED", message: "Event settings are not configured" } };
    }
    const eventDateRange = formatEventDateRange(event.startsAt, event.endsAt);

    let uploadedKey: string | undefined;
    let persisted = false;
    try {
        const buffer = await renderMemberCard(member.team.displayName, member.name, member.role, eventDateRange);
        const key = `uploads/${teamId}/cards/${member.id}-${crypto.randomUUID()}.png`;
        const cardShareToken = crypto.randomUUID();
        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: "image/png",
                ContentLength: buffer.length,
            }),
        );
        uploadedKey = key;

        const cardUrl = `${R2_PUBLIC_URL}/${key}`;
        await prisma.teamMember.update({
            where: { id: member.id },
            data: { cardKey: key, cardUrl, cardShareToken },
        });
        persisted = true;

        if (member.cardKey && member.cardKey !== key) {
            await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: member.cardKey }));
        }

        return { ok: true, data: { id: member.id, cardUrl, cardShareToken } };
    } catch (error) {
        if (uploadedKey && !persisted) {
            try {
                await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: uploadedKey }));
            } catch {
                // Preserve the original generation failure if cleanup also fails.
            }
        }
        console.error("Failed to generate participant card", { error, memberId: member.id, teamId });
        try {
            await prisma.auditLog.create({
                data: {
                    action: "MEMBER_CARD_GENERATION_FAILED",
                    actorId,
                    targetType: "TeamMember",
                    targetId: member.id,
                    details: { error: error instanceof Error ? error.message : "Unknown card generation failure" },
                },
            });
        } catch (auditError) {
            console.error("Failed to audit participant card generation failure", {
                auditError,
                memberId: member.id,
                teamId,
            });
        }
        return { ok: false, error: { code: "CARD_GENERATION_FAILED", message: "Failed to generate member card" } };
    }
}
