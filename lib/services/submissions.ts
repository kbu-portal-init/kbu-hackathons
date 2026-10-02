import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { SubmissionDTO, SubmissionInput } from "@/lib/contracts/submissions";
import { getTeamSubmission } from "@/lib/data/submissions";
import prisma from "@/lib/prisma";

function toDTO(record: NonNullable<Awaited<ReturnType<typeof prisma.submission.findUnique>>>): SubmissionDTO {
    return {
        ...record,
        submittedAt: record.submittedAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
    };
}

async function checkWindow(now = new Date()) {
    const event = await prisma.eventSettings.findUnique({
        where: { id: 1 },
        select: { submissionOpensAt: true, submissionDeadline: true },
    });
    if (!event)
        return {
            ok: false as const,
            code: ErrorCodes.EVENT_NOT_CONFIGURED,
            message: "Event settings are not configured",
        };
    if (now < event.submissionOpensAt || now > event.submissionDeadline)
        return {
            ok: false as const,
            code: ErrorCodes.SUBMISSION_CLOSED,
            message: "Submissions are not currently open",
        };
    return { ok: true as const };
}

export async function saveTeamSubmission(
    teamId: string,
    input: SubmissionInput,
    finalize: boolean,
    actorId: string,
): Promise<ActionResult<SubmissionDTO>> {
    const window = await checkWindow();
    if (!window.ok) return { ok: false, error: { code: window.code, message: window.message } };
    const existing = await prisma.submission.findUnique({ where: { teamId } });
    if (existing?.status === "SUBMITTED" && !finalize)
        return {
            ok: false,
            error: { code: ErrorCodes.SUBMISSION_LOCKED, message: "This submission has already been finalized" },
        };
    const status = finalize ? "SUBMITTED" : existing?.status === "REOPENED" ? "REOPENED" : "DRAFT";
    const record = await prisma.$transaction(async (tx) => {
        const submission = await tx.submission.upsert({
            where: { teamId },
            update: { ...input, status, submittedAt: finalize ? new Date() : (existing?.submittedAt ?? null) },
            create: { teamId, ...input, status, submittedAt: finalize ? new Date() : null },
        });
        await tx.auditLog.create({
            data: {
                actorId,
                action: finalize
                    ? "SUBMISSION_FINALIZED"
                    : existing
                      ? "SUBMISSION_DRAFT_UPDATED"
                      : "SUBMISSION_DRAFT_CREATED",
                targetType: "Submission",
                targetId: submission.id,
            },
        });
        return submission;
    });
    return { ok: true, data: toDTO(record) };
}

export async function reopenSubmission(submissionId: string, actorId: string): Promise<ActionResult<{ id: string }>> {
    const existing = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!existing)
        return { ok: false, error: { code: ErrorCodes.SUBMISSION_NOT_FOUND, message: "Submission not found" } };
    await prisma.$transaction(async (tx) => {
        await tx.submission.update({ where: { id: submissionId }, data: { status: "REOPENED" } });
        await tx.auditLog.create({
            data: { actorId, action: "SUBMISSION_REOPENED", targetType: "Submission", targetId: submissionId },
        });
    });
    return { ok: true, data: { id: submissionId } };
}

export { getTeamSubmission };
