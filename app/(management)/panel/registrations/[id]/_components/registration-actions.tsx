"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { approveRegistrationRequest, rejectRegistrationRequest } from "@/actions/management/registrations";
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
import type { RejectRegistrationInput } from "@/lib/contracts/registration";
import { rejectRegistrationSchema } from "@/lib/contracts/registration";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

export function RegistrationActions({ registrationId }: { registrationId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [rejectOpen, setRejectOpen] = useState(false);

    const rejectForm = useForm<RejectRegistrationInput>({
        resolver: zodResolver(rejectRegistrationSchema),
        defaultValues: { registrationId, reason: "" },
    });

    const onApprove = () => {
        startTransition(async () => {
            const result = await approveRegistrationRequest({ registrationId });
            if (!result.ok) {
                toast.error(result.error.message);
                return;
            }
            toast.success("Registration approved \u2014 magic link sent to leader");
            router.refresh();
        });
    };

    const onReject = async (values: RejectRegistrationInput) => {
        startTransition(async () => {
            const result = await rejectRegistrationRequest(values);
            if (!result.ok) {
                applyActionFieldErrors(result.error.fieldErrors, rejectForm.setError);
                toast.error(result.error.message);
                return;
            }
            toast.success("Registration rejected");
            setRejectOpen(false);
            rejectForm.reset();
            router.refresh();
        });
    };

    return (
        <>
            <div className="flex gap-2">
                <Button onClick={onApprove} disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Approving...
                        </>
                    ) : (
                        "Approve registration"
                    )}
                </Button>
                <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={isPending}>
                    Reject
                </Button>
            </div>

            <Dialog open={rejectOpen} onOpenChange={(open) => !open && setRejectOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject registration</DialogTitle>
                        <DialogDescription>This action sends a rejection email to the team leader.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={rejectForm.handleSubmit(onReject)}>
                        <FieldGroup>
                            <Controller
                                name="reason"
                                control={rejectForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                                        <Textarea
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Explain why this registration was rejected..."
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isPending}>
                                {isPending ? "Rejecting..." : "Reject registration"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
