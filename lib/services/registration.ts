import "server-only";

import type { ActionResult } from "@/lib/contracts/common";
import type { ReviewDecision, ReviewRegistrationData, ReviewRegistrationInput } from "@/lib/contracts/registration";
import prisma from "@/lib/prisma";

export async function reviewRegistration(
    input: ReviewRegistrationInput,
    actorId: string,
): Promise<ActionResult<ReviewRegistrationData>> {
    try {
        await prisma.$transaction(async (tx) => {
            const registration = await tx.registration.findUnique({
                where: { id: input.registrationId },
                select: { id: true, teamId: true, status: true },
            });

            if (!registration) {
                throw new RegistrationNotFoundError(input.registrationId);
            }

            await tx.registrationReview.create({
                data: {
                    registrationId: registration.id,
                    reviewerId: actorId,
                    decision: input.decision,
                    reason: input.reason ?? null,
                },
            });

            await tx.registration.update({
                where: { id: registration.id },
                data: { status: nextStatusFor(input.decision) },
            });

            await tx.auditLog.create({
                data: {
                    actorId,
                    action: `REGISTRATION_${input.decision}`,
                    targetType: "Registration",
                    targetId: registration.id,
                    details: {
                        teamId: registration.teamId,
                        previousStatus: registration.status,
                        nextStatus: nextStatusFor(input.decision),
                        reason: input.reason ?? null,
                    },
                },
            });
        });
    } catch (error) {
        if (error instanceof RegistrationNotFoundError) {
            return {
                ok: false,
                error: { code: "NOT_FOUND", message: "Registration not found" },
            };
        }
        return {
            ok: false,
            error: { code: "REVIEW_FAILED", message: "Failed to review registration" },
        };
    }

    return { ok: true, data: { registrationId: input.registrationId } };
}

function nextStatusFor(decision: ReviewDecision): "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" {
    switch (decision) {
        case "APPROVED":
            return "APPROVED";
        case "REJECTED":
            return "REJECTED";
        case "REOPENED":
            return "PENDING";
    }
}

class RegistrationNotFoundError extends Error {
    constructor(registrationId: string) {
        super(`Registration not found: ${registrationId}`);
        this.name = "RegistrationNotFoundError";
    }
}
