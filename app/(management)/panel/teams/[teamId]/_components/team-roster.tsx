"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    createTeamMember,
    deleteTeamMember,
    updateManagementMemberImage,
    updateTeamMember,
} from "@/actions/management/teams";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import { FileUpload } from "@/components/file-upload";
import { Badge } from "@/components/ui/badge";
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
import type { CreateTeamMemberInput, TeamMemberRole, UpdateTeamMemberInput } from "@/lib/contracts/team-members";
import { createTeamMemberSchema, teamMemberRoleSchema, updateTeamMemberSchema } from "@/lib/contracts/team-members";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type RosterMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    imageUrl: string | null;
    verifiedAt: string | null;
};

const roles = teamMemberRoleSchema.options;

function formatMemberRole(role: string) {
    return role
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();
}

function showVerificationStatus(status: { sent: true } | { sent: false; error: { message: string } } | null) {
    if (!status) return;

    if (status.sent) {
        toast.success("Verification email sent");
    } else {
        toast.warning(`Member saved, but verification email was not sent: ${status.error.message}`);
    }
}

export function TeamRoster({ teamId, members }: { teamId: string; members: RosterMember[] }) {
    const router = useRouter();

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const createForm = useForm<CreateTeamMemberInput>({
        resolver: zodResolver(createTeamMemberSchema),
        defaultValues: {
            teamId,
            name: "",
            studentEmail: "",
            role: "DEVELOPER",
        },
    });

    const editForm = useForm<UpdateTeamMemberInput>({
        resolver: zodResolver(updateTeamMemberSchema),
        defaultValues: {
            teamId,
            memberId: "",
            name: "",
            studentEmail: "",
            role: "DEVELOPER",
        },
    });

    const openCreateDialog = () => {
        createForm.reset({
            teamId,
            name: "",
            studentEmail: "",
            role: "DEVELOPER",
        });
        setCreateOpen(true);
    };

    const openEditDialog = (member: RosterMember) => {
        editForm.reset({
            teamId,
            memberId: member.id,
            name: member.name,
            studentEmail: member.email,
            role: member.role as TeamMemberRole,
        });
        setEditOpen(true);
    };

    const handleCreate = async (values: CreateTeamMemberInput) => {
        const result = await createTeamMember(values);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, createForm.setError);
            toast.error(result.error.message);
            return;
        }

        toast.success("Team member added");
        showVerificationStatus(result.data.verificationEmail);
        setCreateOpen(false);
        createForm.reset();
        router.refresh();
    };

    const handleUpdate = async (values: UpdateTeamMemberInput) => {
        const result = await updateTeamMember(values);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, editForm.setError);
            toast.error(result.error.message);
            return;
        }

        toast.success("Team member updated");

        if (result.data.emailChanged) {
            showVerificationStatus(result.data.verificationEmail);
        }

        setEditOpen(false);
        router.refresh();
    };

    const handleDelete = async (member: RosterMember): Promise<boolean> => {
        const result = await deleteTeamMember({
            teamId,
            memberId: member.id,
        });

        if (!result.ok) {
            toast.error(result.error.message);
            return false;
        }

        if (result.data.cardCleanupFailed) {
            toast.warning("Member deleted, but their card image could not be removed from storage.");
        } else {
            toast.success("Team member deleted");
        }

        router.refresh();
        return true;
    };

    const handleImageUpdate = async (memberId: string, imageUrl: string | null) => {
        const result = await updateManagementMemberImage({
            teamId,
            memberId,
            imageUrl,
        });

        if (!result.ok) {
            throw new Error(result.error.message);
        }

        toast.success(imageUrl ? "Profile image updated" : "Profile image removed");
        router.refresh();
    };

    return (
        <>
            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-display text-xl font-bold">Roster ({members.length})</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage team members, roles, verification, and profile images.
                        </p>
                    </div>

                    <Button onClick={openCreateDialog}>Add member</Button>
                </div>

                {members.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="font-medium">No team members yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Add the first member to this team.</p>
                    </div>
                ) : (
                    <div className="divide-y rounded-lg border px-4">
                        {members.map((member) => (
                            <div key={member.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative size-12 shrink-0">
                                        {member.imageUrl ? (
                                            <Image
                                                src={member.imageUrl}
                                                alt={`${member.name} avatar`}
                                                fill
                                                sizes="48px"
                                                className="rounded-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div
                                                className="flex size-12 items-center justify-center rounded-full bg-accent font-display font-bold text-accent-foreground"
                                                aria-hidden="true"
                                            >
                                                {getInitials(member.name)}
                                            </div>
                                        )}

                                        <FileUpload
                                            category="management-member-profile-image"
                                            uploadContext={{ teamId, memberId: member.id }}
                                            currentFile={member.imageUrl}
                                            iconOverlay
                                            label="Profile image"
                                            editDescription={`Change the profile image for ${member.name}.`}
                                            onUploadComplete={(url) => handleImageUpdate(member.id, url)}
                                            onRemove={() => handleImageUpdate(member.id, null)}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{member.name}</p>
                                        <p className="break-all text-sm text-muted-foreground">{member.email}</p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            <Badge variant="outline">{formatMemberRole(member.role)}</Badge>
                                            <Badge variant={member.verifiedAt ? "default" : "secondary"}>
                                                {member.verifiedAt ? "Verified" : "Unverified"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(member)}>
                                        Edit
                                    </Button>

                                    <ConfirmActionAlertDialog
                                        trigger={
                                            <Button variant="destructive" size="sm">
                                                Delete
                                            </Button>
                                        }
                                        title="Delete team member?"
                                        description={`This will permanently delete ${member.name} from this team. This action cannot be undone.`}
                                        confirmLabel="Delete member"
                                        pendingLabel="Deleting..."
                                        destructive
                                        onConfirm={() => handleDelete(member)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    if (!open && createForm.formState.isSubmitting) return;
                    setCreateOpen(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add team member</DialogTitle>
                        <DialogDescription>
                            Add a member to this team. A verification email will be requested automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createForm.handleSubmit(handleCreate)}>
                        <FieldGroup>
                            <Controller
                                name="name"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-member-name">Full name</FieldLabel>
                                        <Input
                                            {...field}
                                            id="create-member-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter full name"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="studentEmail"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-member-email">Student email</FieldLabel>
                                        <Input
                                            {...field}
                                            id="create-member-email"
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="student@ms.kbu.ac.th"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="role"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Role</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {formatMemberRole(role)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                                disabled={createForm.formState.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.formState.isSubmitting}>
                                {createForm.formState.isSubmitting ? "Adding..." : "Add member"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                    if (!open && editForm.formState.isSubmitting) return;
                    setEditOpen(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit team member</DialogTitle>
                        <DialogDescription>
                            Update the member's details. Changing their email address requires new verification.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={editForm.handleSubmit(handleUpdate)}>
                        <FieldGroup>
                            <Controller
                                name="name"
                                control={editForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="edit-member-name">Full name</FieldLabel>
                                        <Input {...field} id="edit-member-name" aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="studentEmail"
                                control={editForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="edit-member-email">Student email</FieldLabel>
                                        <Input
                                            {...field}
                                            id="edit-member-email"
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="role"
                                control={editForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Role</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {formatMemberRole(role)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditOpen(false);
                                }}
                                disabled={editForm.formState.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.formState.isSubmitting}>
                                {editForm.formState.isSubmitting ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
