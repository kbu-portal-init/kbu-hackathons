"use client";

import { useState } from "react";
import { changeTeamPassword } from "@/actions/participant/team-password";
import { PasswordChangeForm } from "@/components/password-change-form";
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

export function TeamPasswordSettings({ username }: { username: string }) {
    const [resetOpen, setResetOpen] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState<string | null>(null);
    const [resetError, setResetError] = useState(false);

    async function requestReset() {
        setResetting(true);
        setResetMessage(null);
        setResetError(false);
        try {
            const response = await fetch("/api/password-reset/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const result = (await response.json()) as { message?: string };
            setResetMessage(result.message ?? "Check the verified leader email for reset instructions.");
            setResetError(!response.ok);
        } catch {
            setResetMessage("Unable to request a password reset. Please try again.");
            setResetError(true);
        } finally {
            setResetting(false);
        }
    }

    return (
        <section className="rounded-none border-2 border-brand-ink/15 bg-card p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-brand-ink">Password</h2>
                    <p className="mt-1 text-sm text-brand-muted-foreground">
                        Change the shared team account password or request a reset link.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="link"
                    className="h-auto justify-start px-0 font-display text-sm font-semibold text-brand-ink underline decoration-primary decoration-2 underline-offset-4 sm:justify-end"
                    onClick={() => {
                        setResetMessage(null);
                        setResetError(false);
                        setResetOpen(true);
                    }}
                >
                    Forgot password?
                </Button>
            </div>

            <PasswordChangeForm
                idPrefix="team"
                onSubmit={async (values) => {
                    const result = await changeTeamPassword(values);
                    return result.ok ? { ok: true } : { ok: false, error: result.error };
                }}
            />

            <Dialog open={resetOpen} onOpenChange={(open) => !resetting && setResetOpen(open)}>
                <DialogContent className="rounded-none border-2 border-brand-ink">
                    <DialogHeader>
                        <DialogTitle className="font-display">Forgot password?</DialogTitle>
                        <DialogDescription>
                            Reset instructions will be sent to the verified team leader email.
                        </DialogDescription>
                    </DialogHeader>
                    <p
                        className={resetError ? "text-sm text-destructive" : "text-sm text-brand-muted-foreground"}
                        role={resetError ? "alert" : undefined}
                    >
                        {resetMessage ?? `Team username: ${username}`}
                    </p>
                    <DialogFooter>
                        <DialogClose
                            render={
                                <Button
                                    variant="outline"
                                    className="rounded-none border-2 border-brand-ink font-display text-sm font-semibold"
                                    disabled={resetting}
                                />
                            }
                        >
                            Close
                        </DialogClose>
                        {!resetMessage || resetError ? (
                            <Button
                                type="button"
                                className="rounded-none border-2 border-brand-ink bg-brand-ink font-display text-sm font-semibold text-brand-paper hover:bg-brand-yellow hover:text-brand-ink"
                                onClick={() => void requestReset()}
                                disabled={resetting}
                            >
                                {resetting ? "Sending..." : "Send reset link"}
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
