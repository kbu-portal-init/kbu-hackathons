"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { reviewRegistration } from "@/actions/management/registration";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { RegistrationListItem } from "@/lib/contracts/registration";

type ReviewDecision = "APPROVED" | "REJECTED" | "REOPENED";

const CONFIG: Record<ReviewDecision, { title: string; description: string; cta: string }> = {
    APPROVED: {
        title: "Approve registration",
        description: "The team will be cleared to participate and its members notified.",
        cta: "Approve",
    },
    REJECTED: {
        title: "Reject registration",
        description: "The team will be marked as rejected and unable to submit work.",
        cta: "Reject",
    },
    REOPENED: {
        title: "Reopen registration",
        description: "The registration will return to pending for further review.",
        cta: "Reopen",
    },
};

export function RegistrationReviewButton({
    registration,
    decision,
    label,
    variant,
}: {
    registration: RegistrationListItem;
    decision: ReviewDecision;
    label: string;
    variant?: "default" | "destructive" | "ghost";
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const config = CONFIG[decision];

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);
        const result = await reviewRegistration({
            registrationId: registration.id,
            decision,
            reason: note.trim() || undefined,
        });
        setIsSubmitting(false);

        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }

        toast.success(`Registration ${decision.toLowerCase()}.`);
        setOpen(false);
        setNote("");
        router.refresh();
    }

    return (
        <>
            <Button type="button" variant={variant} size="sm" onClick={() => setOpen(true)}>
                {label}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{config.title}</DialogTitle>
                        <DialogDescription>{config.description}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-zinc-500">
                                Team{" "}
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {registration.teamName}
                                </span>
                            </p>
                            <Textarea
                                placeholder="Optional review note (recorded in the audit trail)"
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                rows={4}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                variant={decision === "REJECTED" ? "destructive" : "default"}
                            >
                                {isSubmitting ? "Saving…" : config.cta}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
