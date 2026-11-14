"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteRegistrationRequest, updateRegistrationRequest } from "@/actions/management/registrations";
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
import { Textarea } from "@/components/ui/textarea";
import type { UpdateRegistrationInput } from "@/lib/contracts/registration";
import { updateRegistrationSchema } from "@/lib/contracts/registration";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Props = {
    registrationId: string;
    status: string;
    applicationNotes: string | null;
};

export function RegistrationCrudActions({ registrationId, status, applicationNotes }: Props) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const form = useForm<UpdateRegistrationInput>({
        resolver: zodResolver(updateRegistrationSchema),
        defaultValues: {
            registrationId,
            applicationNotes,
        },
    });

    const handleEditOpen = (open: boolean) => {
        if (form.formState.isSubmitting) return;
        setFormError(null);
        if (open) {
            form.reset({ registrationId, applicationNotes });
        }
        setEditOpen(open);
    };

    const onUpdate = async (values: UpdateRegistrationInput) => {
        setFormError(null);
        try {
            const result = await updateRegistrationRequest(values);

            if (!result.ok) {
                applyActionFieldErrors(result.error.fieldErrors, form.setError);
                toast.error(result.error.message);
                return;
            }

            toast.success("Application notes updated");
            setEditOpen(false);
            router.refresh();
        } catch {
            setFormError("Unable to update registration. Please try again.");
        }
    };

    const onDelete = async (): Promise<boolean> => {
        const result = await deleteRegistrationRequest({ registrationId });

        if (!result.ok) {
            toast.error(result.error.message);
            return false;
        }

        toast.success("Registration deleted");
        router.push("/panel/registrations");
        router.refresh();
        return true;
    };

    return (
        <section className="space-y-3 border-2 border-border/15 bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Application notes</p>
                    <p className="text-sm whitespace-pre-wrap">
                        {applicationNotes || "No application notes provided."}
                    </p>
                </div>

                <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditOpen(true)}>
                        Edit notes
                    </Button>

                    {status !== "APPROVED" && (
                        <ConfirmActionAlertDialog
                            trigger={
                                <Button variant="destructive" size="sm">
                                    Delete registration
                                </Button>
                            }
                            title="Delete this registration?"
                            description="This permanently deletes the registration and its review history. The associated team and team members will remain in the system. This action cannot be undone."
                            confirmLabel="Delete registration"
                            pendingLabel="Deleting..."
                            destructive
                            onConfirm={onDelete}
                        />
                    )}
                </div>
            </div>

            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit application notes</DialogTitle>
                        <DialogDescription>Update the notes associated with this registration.</DialogDescription>
                    </DialogHeader>

                    <form onChange={() => setFormError(null)} onSubmit={form.handleSubmit(onUpdate)}>
                        {formError && (
                            <p role="alert" className="text-sm text-destructive">
                                {formError}
                            </p>
                        )}
                        <FieldGroup>
                            <Controller
                                name="applicationNotes"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="application-notes">Application notes</FieldLabel>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ""}
                                            id="application-notes"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter application notes..."
                                            rows={6}
                                            maxLength={2000}
                                        />
                                        <p className="text-xs text-muted-foreground">Maximum 2,000 characters.</p>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleEditOpen(false)}
                                disabled={form.formState.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : "Save notes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
