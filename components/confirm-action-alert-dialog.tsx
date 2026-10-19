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

type ConfirmActionAlertDialogProps = {
    trigger: ReactElement;
    title: string;
    description: string;
    confirmLabel?: string;
    pendingLabel?: string;
    destructive?: boolean;
    onConfirm: () => Promise<boolean> | Promise<void>;
};

export function ConfirmActionAlertDialog({
    trigger,
    title,
    description,
    confirmLabel = "Confirm",
    pendingLabel = "Please wait...",
    destructive = false,
    onConfirm,
}: ConfirmActionAlertDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleConfirm = async () => {
        setIsPending(true);

        try {
            const result = await onConfirm();

            if (result !== false) {
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger render={trigger} />

            <AlertDialogContent className="border-2 border-border bg-card ring-0">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isPending}
                        className="border-2 border-border bg-background font-display font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={isPending}
                        onClick={handleConfirm}
                        className={
                            destructive
                                ? "border-2 border-destructive/40 bg-destructive/10 font-display font-semibold text-destructive hover:bg-destructive/20"
                                : "border-2 border-border bg-foreground font-display font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                        }
                    >
                        {isPending ? pendingLabel : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
