"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { banTeam, unbanTeam } from "@/actions/management/teams";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BanAccountFormInput, BanAccountInput } from "@/lib/contracts/accounts";
import { banAccountSchema } from "@/lib/contracts/accounts";
import type { TeamListItem } from "@/lib/contracts/teams";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

export function TeamActions({ team }: { team: TeamListItem }) {
    const router = useRouter();
    const [banOpen, setBanOpen] = useState(false);
    const form = useForm<BanAccountFormInput, unknown, BanAccountInput>({
        resolver: zodResolver(banAccountSchema),
        defaultValues: { userId: team.userId ?? "", reason: "", expiresAt: null },
    });

    if (!team.userId) return null;

    const handleBan = async (values: BanAccountInput) => {
        const result = await banTeam(values);
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, form.setError);
            toast.error(result.error.message);
            return;
        }
        toast.success("Team banned");
        setBanOpen(false);
        router.refresh();
    };

    const handleUnban = async () => {
        const result = await unbanTeam({ userId: team.userId });
        if (!result.ok) {
            toast.error(result.error.message);
            return false;
        }
        toast.success("Team unbanned");
        router.refresh();
        return true;
    };

    return team.banned ? (
        <ConfirmActionAlertDialog
            trigger={
                <Button variant="outline" size="sm">
                    Unban
                </Button>
            }
            title={`Unban ${team.displayName}?`}
            description="Restore this team account's access?"
            confirmLabel="Unban"
            pendingLabel="Unbanning..."
            onConfirm={handleUnban}
        />
    ) : (
        <>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                    form.reset({ userId: team.userId ?? "", reason: "", expiresAt: null });
                    setBanOpen(true);
                }}
            >
                Ban
            </Button>
            <Dialog open={banOpen} onOpenChange={setBanOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban {team.displayName}</DialogTitle>
                        <DialogDescription>
                            This revokes all active team sessions. Leave expiry empty for a permanent ban.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleBan)}>
                        <FieldGroup>
                            <input type="hidden" {...form.register("userId")} />
                            <Field data-invalid={!!form.formState.errors.reason}>
                                <FieldLabel htmlFor={`ban-reason-${team.id}`}>Reason</FieldLabel>
                                <Input
                                    id={`ban-reason-${team.id}`}
                                    {...form.register("reason")}
                                    aria-invalid={!!form.formState.errors.reason}
                                />
                                {form.formState.errors.reason && <FieldError errors={[form.formState.errors.reason]} />}
                            </Field>
                            <Field data-invalid={!!form.formState.errors.expiresAt}>
                                <FieldLabel htmlFor={`ban-expires-${team.id}`}>Expires at (optional)</FieldLabel>
                                <Input
                                    id={`ban-expires-${team.id}`}
                                    type="datetime-local"
                                    {...form.register("expiresAt", {
                                        setValueAs: (value) => (value ? new Date(value) : null),
                                    })}
                                />
                                {form.formState.errors.expiresAt && (
                                    <FieldError errors={[form.formState.errors.expiresAt]} />
                                )}
                            </Field>
                        </FieldGroup>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setBanOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Banning..." : "Confirm ban"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
