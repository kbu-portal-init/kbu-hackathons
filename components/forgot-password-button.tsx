"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function ForgotPasswordButton({ email }: { email: string }) {
    const [open, setOpen] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [message, setMessage] = useState<string>();
    const [error, setError] = useState(false);

    async function requestReset() {
        setIsRequesting(true);
        setMessage(undefined);
        setError(false);
        try {
            const response = await fetch("/api/password-reset/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const result = (await response.json()) as { message?: string };
            setMessage(result.message ?? "Check your email for password reset instructions.");
            setError(!response.ok);
        } catch {
            setMessage("Unable to request a password reset. Please try again.");
            setError(true);
        } finally {
            setIsRequesting(false);
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs"
                onClick={() => {
                    setMessage(undefined);
                    setError(false);
                    setOpen(true);
                }}
            >
                Forgot password?
            </Button>
            <Dialog open={open} onOpenChange={(nextOpen) => !isRequesting && setOpen(nextOpen)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Forgot password?</DialogTitle>
                        <DialogDescription>
                            We will send password-reset instructions to your account email.
                        </DialogDescription>
                    </DialogHeader>
                    <p
                        className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
                        role={error ? "alert" : "status"}
                    >
                        {message ?? `Email: ${email}`}
                    </p>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" disabled={isRequesting} />}>Close</DialogClose>
                        {!message || error ? (
                            <Button type="button" onClick={() => void requestReset()} disabled={isRequesting}>
                                {isRequesting ? "Sending..." : "Send reset link"}
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
