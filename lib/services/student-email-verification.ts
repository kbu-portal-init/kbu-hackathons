import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { ActionResult } from "@/lib/contracts/common";
import { type StudentEmailVerificationData, studentEmailSchema } from "@/lib/contracts/email";
import { ErrorCodes, ErrorMessages } from "@/lib/contracts/errors";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/services/notifications";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function sendStudentEmailVerification(teamMemberId: string) {
    const member = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
    if (!member) throw new Error("Team member not found");
    if (!studentEmailSchema.safeParse(member.studentEmail).success) throw new Error("Invalid student email domain");

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.$transaction(async (tx) => {
        // delete any existing unverified verifications for this team member
        await tx.studentEmailVerification.deleteMany({ where: { teamMemberId, verifiedAt: null } });
        await tx.studentEmailVerification.create({ data: { teamMemberId, tokenHash, expiresAt } });
    });

    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/student-email/verify?token=${encodeURIComponent(token)}`;
    await sendNotification({
        type: "STUDENT_EMAIL_VERIFICATION",
        recipients: [member.studentEmail],
        data: { verificationUrl: url },
        targetType: "TeamMember",
        targetId: member.id,
    });
}

export async function consumeStudentEmailVerification(
    token: string,
): Promise<ActionResult<StudentEmailVerificationData>> {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const now = new Date();
    const verification = await prisma.studentEmailVerification.findUnique({ where: { tokenHash } });

    if (!verification) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.INVALID_VERIFICATION_TOKEN,
                message: ErrorMessages[ErrorCodes.INVALID_VERIFICATION_TOKEN],
            },
        };
    }

    if (verification.verifiedAt) {
        return {
            ok: true,
            data: {
                teamMemberId: verification.teamMemberId,
                verifiedAt: verification.verifiedAt.toISOString(),
                alreadyVerified: true,
            },
        };
    }

    if (verification.expiresAt <= now) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.INVALID_VERIFICATION_TOKEN,
                message: ErrorMessages[ErrorCodes.INVALID_VERIFICATION_TOKEN],
            },
        };
    }

    const updated = await prisma.$transaction(async (tx) => {
        const claimed = await tx.studentEmailVerification.updateMany({
            where: { id: verification.id, verifiedAt: null, expiresAt: { gt: now } },
            data: { verifiedAt: now },
        });
        if (claimed.count !== 1) return null;
        await tx.teamMember.update({ where: { id: verification.teamMemberId }, data: { studentEmailVerifiedAt: now } });
        return true;
    });

    if (!updated) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.INVALID_VERIFICATION_TOKEN,
                message: ErrorMessages[ErrorCodes.INVALID_VERIFICATION_TOKEN],
            },
        };
    }

    return {
        ok: true,
        data: {
            teamMemberId: verification.teamMemberId,
            verifiedAt: now.toISOString(),
            alreadyVerified: false,
        },
    };
}

export async function allMembersVerified(teamId: string): Promise<boolean> {
    const unverified = await prisma.teamMember.count({
        where: { teamId, studentEmailVerifiedAt: null },
    });
    return unverified === 0;
}
