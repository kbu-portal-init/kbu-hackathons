"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTeamMember } from "@/actions/participant/team-workspace";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function RemoveMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onConfirm() {
        setIsSubmitting(true);
        const result = await deleteTeamMember({ memberId });
        setIsSubmitting(false);

        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }

        toast.success(`${memberName} removed from the team.`);
        setOpen(false);
        router.refresh();
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
                render={
                    <Button type="button" variant="ghost" size="sm">
                        Remove
                    </Button>
                }
            />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove the member from your team roster. The action is recorded in the audit trail.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? "Removing…" : "Remove member"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
