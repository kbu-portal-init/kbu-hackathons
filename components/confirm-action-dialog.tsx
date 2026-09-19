"use client";

import { type ReactElement, useState } from "react";
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

type ConfirmActionDialogProps = {
    trigger: ReactElement;
    title: string;
    description: string;
    confirmLabel?: string;
    pendingLabel?: string;
    onConfirm: () => Promise<void>;
};

export function ConfirmActionDialog({
    trigger,
    title,
    description,
    confirmLabel = "Confirm",
    pendingLabel = "Please wait...",
    onConfirm,
}: ConfirmActionDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleConfirm = async () => {
        setIsPending(true);
        try {
            await onConfirm();
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={trigger} />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={isPending} onClick={handleConfirm}>
                        {isPending ? pendingLabel : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
