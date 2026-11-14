"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    archiveTeamRequest,
    banTeam,
    unarchiveTeamRequest,
    unbanTeam,
    updateTeamRequest,
} from "@/actions/management/teams";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BanAccountFormInput, BanAccountInput } from "@/lib/contracts/accounts";
import { banAccountSchema } from "@/lib/contracts/accounts";
import type { TeamListItem, UpdateTeamInput } from "@/lib/contracts/teams";
import { updateTeamSchema } from "@/lib/contracts/teams";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

export function TeamActions({ team }: { team: TeamListItem }) {
    const router = useRouter();

    const [banOpen, setBanOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<UpdateTeamInput | null>(null);

    const banForm = useForm<BanAccountFormInput, unknown, BanAccountInput>({
        resolver: zodResolver(banAccountSchema),
        defaultValues: { userId: team.userId ?? "", reason: "", expiresAt: null },
    });

    const editForm = useForm<UpdateTeamInput>({
        resolver: zodResolver(updateTeamSchema),
        defaultValues: {
            teamId: team.id,
            displayName: team.displayName,
            program: team.program,
        },
    });

    const handleEditOpen = (open: boolean) => {
        if (open) {
            editForm.reset({
                teamId: team.id,
                displayName: team.displayName,
                program: team.program,
            });
            setPendingUpdate(null);
        }

        setEditOpen(open);
    };

    const saveTeam = async (values: UpdateTeamInput): Promise<boolean> => {
        const result = await updateTeamRequest(values);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, editForm.setError);
            toast.error(result.error.message);
            return false;
        }

        toast.success("Team updated");
        setPendingUpdate(null);
        setEditOpen(false);
        router.refresh();
        return true;
    };

    const handleEditSubmit = async (values: UpdateTeamInput) => {
        if (values.program !== team.program) {
            setPendingUpdate(values);
            return;
        }

        await saveTeam(values);
    };

    const handleArchive = async (): Promise<boolean> => {
        const result = await archiveTeamRequest({ teamId: team.id });

        if (!result.ok) {
            toast.error(result.error.message);
            return false;
        }

        toast.success("Team archived");
        router.refresh();
        return true;
    };

    const handleUnarchive = async (): Promise<boolean> => {
        const result = await unarchiveTeamRequest({ teamId: team.id });

        if (!result.ok) {
            toast.error(result.error.message);
            return false;
        }

        toast.success("Team unarchived");
        router.refresh();
        return true;
    };

    const handleBan = async (values: BanAccountInput) => {
        const result = await banTeam(values);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, banForm.setError);
            toast.error(result.error.message);
            return;
        }

        toast.success("Team banned");
        setBanOpen(false);
        router.refresh();
    };

    const handleUnban = async (): Promise<boolean> => {
        if (!team.userId) return false;

        const result = await unbanTeam({ userId: team.userId });

        if (!result.ok) {
            toast.error(result.error.message);
            return false;
        }

        toast.success("Team unbanned");
        router.refresh();
        return true;
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEditOpen(true)}>
                Edit
            </Button>

            {team.archivedAt ? (
                <ConfirmActionAlertDialog
                    trigger={
                        <Button variant="outline" size="sm">
                            Unarchive
                        </Button>
                    }
                    title={`Unarchive ${team.displayName}?`}
                    description="This will restore the team's access to its account, provided its registration is approved."
                    confirmLabel="Unarchive"
                    pendingLabel="Unarchiving..."
                    onConfirm={handleUnarchive}
                />
            ) : (
                <ConfirmActionAlertDialog
                    trigger={
                        <Button variant="outline" size="sm">
                            Archive
                        </Button>
                    }
                    title={`Archive ${team.displayName}?`}
                    description="This will prevent the team from signing in. The team and its associated data will remain in the system."
                    confirmLabel="Archive"
                    pendingLabel="Archiving..."
                    destructive
                    onConfirm={handleArchive}
                />
            )}

            {team.userId &&
                (team.banned ? (
                    <ConfirmActionAlertDialog
                        trigger={
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-border font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
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
                            className="text-xs"
                            onClick={() => {
                                banForm.reset({
                                    userId: team.userId ?? "",
                                    reason: "",
                                    expiresAt: null,
                                });
                                setBanOpen(true);
                            }}
                        >
                            Ban
                        </Button>

                        <Dialog open={banOpen} onOpenChange={setBanOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="font-display">Ban {team.displayName}</DialogTitle>
                                    <DialogDescription>
                                        This revokes all active team sessions. Leave expiry empty for a permanent ban.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={banForm.handleSubmit(handleBan)}>
                                    <FieldGroup>
                                        <input type="hidden" {...banForm.register("userId")} />

                                        <Field data-invalid={!!banForm.formState.errors.reason}>
                                            <FieldLabel htmlFor={`ban-reason-${team.id}`}>Reason</FieldLabel>
                                            <Input
                                                id={`ban-reason-${team.id}`}
                                                className="h-11"
                                                {...banForm.register("reason")}
                                                aria-invalid={!!banForm.formState.errors.reason}
                                            />
                                            {banForm.formState.errors.reason && (
                                                <FieldError errors={[banForm.formState.errors.reason]} />
                                            )}
                                        </Field>

                                        <Field data-invalid={!!banForm.formState.errors.expiresAt}>
                                            <FieldLabel htmlFor={`ban-expires-${team.id}`}>
                                                Expires at (optional)
                                            </FieldLabel>
                                            <Input
                                                id={`ban-expires-${team.id}`}
                                                type="datetime-local"
                                                className="h-11"
                                                {...banForm.register("expiresAt", {
                                                    setValueAs: (value) => (value ? new Date(value) : null),
                                                })}
                                            />
                                            {banForm.formState.errors.expiresAt && (
                                                <FieldError errors={[banForm.formState.errors.expiresAt]} />
                                            )}
                                        </Field>
                                    </FieldGroup>

                                    <DialogFooter className="mt-4 border-t-2 border-border/15 pt-4">
                                        <Button variant="outline" type="button" onClick={() => setBanOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={banForm.formState.isSubmitting}
                                            className="border-2 border-destructive/40 font-display text-sm font-semibold"
                                        >
                                            {banForm.formState.isSubmitting ? "Banning..." : "Confirm ban"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </>
                ))}

            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display">Edit {team.displayName}</DialogTitle>
                        <DialogDescription>
                            Update the team's display name or education programme. Programme changes require
                            confirmation and are subject to the destination quota.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
                        <FieldGroup>
                            <input type="hidden" {...editForm.register("teamId")} />

                            <Field data-invalid={!!editForm.formState.errors.displayName}>
                                <FieldLabel htmlFor={`team-name-${team.id}`}>Team name</FieldLabel>
                                <Input
                                    id={`team-name-${team.id}`}
                                    className="h-11"
                                    {...editForm.register("displayName", {
                                        onChange: () => setPendingUpdate(null),
                                    })}
                                    aria-invalid={!!editForm.formState.errors.displayName}
                                />
                                {editForm.formState.errors.displayName && (
                                    <FieldError errors={[editForm.formState.errors.displayName]} />
                                )}
                            </Field>

                            <Field data-invalid={!!editForm.formState.errors.program}>
                                <FieldLabel htmlFor={`team-program-${team.id}`}>Education programme</FieldLabel>

                                <Select
                                    value={editForm.watch("program")}
                                    onValueChange={(value) => {
                                        if (value === "THAI_PROGRAM" || value === "INTERNATIONAL_PROGRAM") {
                                            editForm.setValue("program", value, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });
                                            setPendingUpdate(null);
                                        }
                                    }}
                                >
                                    <SelectTrigger id={`team-program-${team.id}`}>
                                        <SelectValue placeholder="Select a programme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="THAI_PROGRAM">Thai Programme</SelectItem>
                                        <SelectItem value="INTERNATIONAL_PROGRAM">International Programme</SelectItem>
                                    </SelectContent>
                                </Select>

                                {editForm.formState.errors.program && (
                                    <FieldError errors={[editForm.formState.errors.program]} />
                                )}
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-4 border-t-2 border-border/15 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleEditOpen(false)}
                                disabled={editForm.formState.isSubmitting}
                            >
                                Cancel
                            </Button>

                            {pendingUpdate ? (
                                <ConfirmActionAlertDialog
                                    trigger={
                                        <Button type="button" disabled={editForm.formState.isSubmitting}>
                                            Confirm programme change
                                        </Button>
                                    }
                                    title="Change the team's programme?"
                                    description="This change may affect programme quota allocation. The update will only proceed if the destination programme has available capacity."
                                    confirmLabel="Confirm change"
                                    pendingLabel="Updating..."
                                    onConfirm={() => saveTeam(pendingUpdate)}
                                />
                            ) : (
                                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                                    {editForm.formState.isSubmitting ? "Saving..." : "Save changes"}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
