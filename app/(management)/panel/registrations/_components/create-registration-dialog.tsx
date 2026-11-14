"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createRegistrationRequest } from "@/actions/management/registrations";
import { MemberRow } from "@/app/(public)/register/_components/member-row";
import { ProgramPicker } from "@/app/(public)/register/_components/program-picker";
import { RosterSummary } from "@/app/(public)/register/_components/roster-summary";
import { TeamSizeStepper } from "@/app/(public)/register/_components/team-size-stepper";
import type { FormValues, ProgramSlot, SubmittedFormValues } from "@/app/(public)/register/_components/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeamMemberRole } from "@/generated/prisma/enums";
import { submitRegistrationSchema } from "@/lib/contracts/registration";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Props = {
    creationConfig: {
        minTeamSize: number;
        maxTeamSize: number;
        programSlots: ProgramSlot[];
    } | null;
};

export function CreateRegistrationDialog({ creationConfig }: Props) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedTeamSize, setSelectedTeamSize] = useState(creationConfig?.minTeamSize ?? 2);
    const [applicationNotes, setApplicationNotes] = useState("");

    const form = useForm<FormValues, unknown, SubmittedFormValues>({
        resolver: zodResolver(submitRegistrationSchema),
        defaultValues: {
            teamName: "",
            leaderName: "",
            leaderEmail: "",
            leaderRole: TeamMemberRole.LEADER,
            members: Array.from({ length: Math.max(0, (creationConfig?.minTeamSize ?? 2) - 1) }, () => ({
                name: "",
                role: TeamMemberRole.DEVELOPER,
                email: "",
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const [watchedTeamName, watchedProgram, watchedLeaderName, watchedMembers] = form.watch([
        "teamName",
        "program",
        "leaderName",
        "members",
    ]);

    if (!creationConfig) {
        return <Button disabled>Create registration</Button>;
    }

    const { minTeamSize, maxTeamSize, programSlots } = creationConfig;
    const hasAvailableProgram = programSlots.some((slot) => slot.remaining > 0);

    const changeTeamSize = (nextTeamSize: number) => {
        if (nextTeamSize === selectedTeamSize) return;

        const targetMembers = Math.max(0, nextTeamSize - 1);
        const currentMembers = form.getValues("members")?.length ?? 0;

        if (targetMembers > currentMembers) {
            for (let i = currentMembers; i < targetMembers; i++) {
                append({ name: "", role: TeamMemberRole.DEVELOPER, email: "" }, { shouldFocus: false });
            }
        } else if (targetMembers < currentMembers) {
            remove(Array.from({ length: currentMembers - targetMembers }, (_, i) => targetMembers + i));
        }

        setSelectedTeamSize(nextTeamSize);
    };

    const resetForm = () => {
        form.reset({
            teamName: "",
            leaderName: "",
            leaderEmail: "",
            leaderRole: TeamMemberRole.LEADER,
            members: Array.from({ length: Math.max(0, minTeamSize - 1) }, () => ({
                name: "",
                role: TeamMemberRole.DEVELOPER,
                email: "",
            })),
        });
        setSelectedTeamSize(minTeamSize);
        setApplicationNotes("");
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && form.formState.isSubmitting) return;

        setOpen(nextOpen);
        if (!nextOpen) resetForm();
    };

    const onSubmit = async (values: SubmittedFormValues) => {
        setFormError(null);
        try {
            const result = await createRegistrationRequest({
                ...values,
                applicationNotes: applicationNotes.trim() || null,
            });

            if (!result.ok) {
                applyActionFieldErrors(result.error.fieldErrors, form.setError);
                toast.error(result.error.message);
                return;
            }

            toast.success(
                result.data.verificationEmailsSent
                    ? "Registration created. Verification emails sent."
                    : "Registration created, but verification emails could not be sent.",
            );

            setOpen(false);
            resetForm();
            router.refresh();
        } catch {
            setFormError("Unable to create registration. Please try again.");
        }
    };

    const rosterNames = [watchedLeaderName ?? "", ...(watchedMembers ?? []).map((member) => member?.name ?? "")];

    return (
        <>
            <Button onClick={() => setOpen(true)}>Create registration</Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="font-display">Create registration</DialogTitle>
                        <DialogDescription>
                            Create a pending registration for a team. Members will still need to verify their student
                            email addresses before approval.
                        </DialogDescription>
                    </DialogHeader>

                    {!hasAvailableProgram ? (
                        <div className="border-2 border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            Both programme quotas are currently full. You cannot create another registration.
                        </div>
                    ) : null}

                    <form
                        onChange={() => setFormError(null)}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {formError && (
                            <p role="alert" className="text-sm text-destructive">
                                {formError}
                            </p>
                        )}
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
                            <div className="space-y-5">
                                <FieldGroup>
                                    <Controller
                                        name="teamName"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Team name</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="e.g. Byte Builders"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="program"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel id="management-program-label">
                                                    Education programme
                                                </FieldLabel>
                                                <ProgramPicker
                                                    name={field.name}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    invalid={fieldState.invalid}
                                                    slots={programSlots}
                                                    labelledBy="management-program-label"
                                                    locale="en"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Field>
                                        <FieldLabel id="management-team-size-label">Team size</FieldLabel>
                                        <TeamSizeStepper
                                            value={selectedTeamSize}
                                            min={minTeamSize}
                                            max={maxTeamSize}
                                            onChange={changeTeamSize}
                                            labelledBy="management-team-size-label"
                                            locale="en"
                                        />
                                        <FieldDescription>
                                            A team must contain between {minTeamSize} and {maxTeamSize} members.
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>

                                <div className="border-t-2 border-border/15 pt-5">
                                    <h3 className="mb-4 font-display text-base font-semibold">Team leader</h3>
                                    <FieldGroup>
                                        <Controller
                                            name="leaderName"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="Jane Doe"
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />

                                        <Field>
                                            <FieldLabel>Role</FieldLabel>
                                            <div className="flex h-10 items-center border-2 border-border/15 bg-muted px-3 text-sm text-muted-foreground">
                                                Team leader
                                            </div>
                                        </Field>

                                        <Controller
                                            name="leaderEmail"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name}>Student email</FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        type="email"
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder="u...@ms.kbu.ac.th"
                                                    />
                                                    <FieldDescription>
                                                        Must use the @ms.kbu.ac.th student email domain.
                                                    </FieldDescription>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                </div>

                                <div className="border-t-2 border-border/15 pt-5">
                                    <h3 className="mb-4 font-display text-base font-semibold">
                                        Other team members ({selectedTeamSize - 1})
                                    </h3>
                                    <FieldGroup className="gap-3">
                                        {fields.map((field, index) => (
                                            <MemberRow
                                                key={field.id}
                                                index={index}
                                                control={form.control}
                                                locale="en"
                                            />
                                        ))}
                                    </FieldGroup>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="management-application-notes">Application notes</FieldLabel>
                                    <Textarea
                                        id="management-application-notes"
                                        value={applicationNotes}
                                        onChange={(event) => setApplicationNotes(event.target.value)}
                                        maxLength={2000}
                                        rows={4}
                                        placeholder="Optional notes about this registration..."
                                    />
                                    <FieldDescription>Optional. Maximum 2,000 characters.</FieldDescription>
                                </Field>
                            </div>

                            <aside className="space-y-4 lg:sticky lg:top-0">
                                <RosterSummary
                                    teamName={watchedTeamName}
                                    program={watchedProgram}
                                    names={rosterNames}
                                    teamSize={selectedTeamSize}
                                    locale="en"
                                />
                            </aside>
                        </div>

                        <DialogFooter className="border-t-2 border-border/15 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={form.formState.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || !hasAvailableProgram}>
                                {form.formState.isSubmitting ? "Creating..." : "Create pending registration"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
