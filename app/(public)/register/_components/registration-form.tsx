"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { type Control, Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { submitTeamRegistration } from "@/actions/management/registrations";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMemberRole } from "@/generated/prisma/enums";
import { submitRegistrationSchema } from "@/lib/contracts/registration";
import { formatRole } from "@/lib/util";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type FormValues = z.input<typeof submitRegistrationSchema>;
type SubmittedFormValues = z.output<typeof submitRegistrationSchema>;

const roleOptions = [
    { value: TeamMemberRole.DEVELOPER, label: formatRole(TeamMemberRole.DEVELOPER) },
    { value: TeamMemberRole.DESIGNER, label: formatRole(TeamMemberRole.DESIGNER) },
    { value: TeamMemberRole.PRODUCT_MANAGER, label: formatRole(TeamMemberRole.PRODUCT_MANAGER) },
    { value: TeamMemberRole.MARKETER, label: formatRole(TeamMemberRole.MARKETER) },
    { value: TeamMemberRole.PRESENTER, label: formatRole(TeamMemberRole.PRESENTER) },
    { value: TeamMemberRole.RESEARCHER, label: formatRole(TeamMemberRole.RESEARCHER) },
    { value: TeamMemberRole.TESTER, label: formatRole(TeamMemberRole.TESTER) },
    { value: TeamMemberRole.OTHER, label: formatRole(TeamMemberRole.OTHER) },
] as const;

export function RegistrationForm({ minTeamSize, maxTeamSize }: { minTeamSize: number; maxTeamSize: number }) {
    const [submitted, setSubmitted] = useState(false);
    const [selectedTeamSize, setSelectedTeamSize] = useState(minTeamSize);
    const [informationOpen, setInformationOpen] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);
    const [verificationEmailsSent, setVerificationEmailsSent] = useState(true);

    const form = useForm<FormValues, unknown, SubmittedFormValues>({
        resolver: zodResolver(submitRegistrationSchema),
        defaultValues: {
            teamName: "",
            leaderName: "",
            leaderEmail: "",
            leaderRole: TeamMemberRole.LEADER,
            members: Array.from({ length: Math.max(0, minTeamSize - 1) }, () => ({
                name: "",
                role: TeamMemberRole.DEVELOPER,
                email: "",
            })),
        },
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const teamSize = selectedTeamSize;

    const changeTeamSize = (value: string | null) => {
        if (!value) return;
        const nextTeamSize = Number(value);
        setSelectedTeamSize(nextTeamSize);
        replace(
            Array.from(
                { length: Math.max(0, nextTeamSize - 1) },
                (_, index) => fields[index] ?? { name: "", role: TeamMemberRole.DEVELOPER, email: "" },
            ),
        );
    };

    const onSubmit = (values: SubmittedFormValues) => {
        if (!acknowledged) {
            setInformationOpen(true);
            return;
        }
        void completeSubmission(values);
    };

    const completeSubmission = async (values: SubmittedFormValues) => {
        const result = await submitTeamRegistration({
            ...values,
            leaderRole: values.leaderRole ?? TeamMemberRole.LEADER,
        });
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, form.setError);
            toast.error(result.error.message);
            return;
        }
        toast.success(
            result.data.verificationEmailsSent
                ? "Registration submitted!"
                : "Registration saved, but some verification emails could not be sent.",
        );
        setVerificationEmailsSent(result.data.verificationEmailsSent);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-white p-8 text-center shadow-xl shadow-green-100/40 dark:border-green-900 dark:bg-zinc-900 dark:shadow-none">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    <CheckCircle2 className="size-7" />
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight">Registration submitted!</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {verificationEmailsSent
                        ? "Verification links have been sent to all team members. Once everyone verifies their email, your team will be automatically approved and the leader will receive a login link."
                        : "Your registration was saved, but some verification emails could not be sent. Please contact the organizers so they can resend them."}
                </p>
                <Button variant="outline" className="mt-8" onClick={() => setSubmitted(false)}>
                    Register another team
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-8 rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                {/* Team Information */}
                <FieldSet>
                    <FieldLegend className="border-b border-primary/30 pb-1 text-base font-semibold text-foreground">
                        About your team
                    </FieldLegend>
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
                                    <FieldDescription>Choose a unique name for your team.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Field>
                            <FieldLabel htmlFor="team-size">Team size</FieldLabel>
                            <Select value={String(selectedTeamSize)} onValueChange={changeTeamSize}>
                                <SelectTrigger id="team-size" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent alignItemWithTrigger={false}>
                                    {Array.from({ length: maxTeamSize - minTeamSize + 1 }, (_, index) => {
                                        const size = minTeamSize + index;
                                        return (
                                            <SelectItem key={size} value={String(size)}>
                                                {size} members
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <FieldDescription>
                                Choose between {minTeamSize} and {maxTeamSize} total members, including the leader.
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </FieldSet>

                {/* Team Leader */}
                <FieldSet>
                    <FieldLegend className="border-b border-primary/30 pb-1 text-base font-semibold text-foreground">
                        Team leader details
                    </FieldLegend>
                    <FieldGroup>
                        <div className="grid gap-5 sm:grid-cols-2">
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
                                <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                                    Leader
                                </div>
                            </Field>
                        </div>
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
                                    <FieldDescription>Must be a valid @ms.kbu.ac.th email address.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>

                {/* Team Members */}
                <FieldSet>
                    <FieldLegend className="border-b border-primary/30 pb-1 text-base font-semibold text-foreground">
                        Other team members ({teamSize - 1})
                    </FieldLegend>
                    <FieldGroup className="gap-3">
                        {fields.map((field, index) => (
                            <MemberRow key={field.id} index={index} control={form.control} />
                        ))}
                    </FieldGroup>
                </FieldSet>

                <div className="flex items-center justify-between gap-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => setInformationOpen(true)}>
                        Read before submitting
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting || !acknowledged} className="min-w-40">
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit registration"
                        )}
                    </Button>
                </div>
            </div>
            <AlertDialog open={informationOpen} onOpenChange={setInformationOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Before you submit</AlertDialogTitle>
                        <AlertDialogDescription>
                            <div className="flex flex-col gap-3">
                                <p>
                                    We will send verification links to all team members, and each member must verify
                                    their student email address.
                                </p>
                                <p>After everyone verifies, the team will be reviewed.</p>
                                <p>The leader will receive a sign-in link when the registration is approved.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <FieldSet className="border-t pt-4">
                        <Field orientation="horizontal" className="items-start">
                            <input
                                id="registration-acknowledgment"
                                type="checkbox"
                                checked={acknowledged}
                                onChange={(event) => setAcknowledged(event.target.checked)}
                                className="mt-1 size-4 accent-orange-600"
                            />
                            <FieldLabel htmlFor="registration-acknowledgment" className="text-sm leading-5">
                                I acknowledge that the information I provided is accurate and understand the
                                registration requirements.
                            </FieldLabel>
                        </Field>
                    </FieldSet>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setInformationOpen(false)} disabled={!acknowledged}>
                            I understand
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    );
}

function MemberRow({ index, control }: { index: number; control: Control<FormValues, unknown, SubmittedFormValues> }) {
    return (
        <FieldGroup>
            <div className="flex gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="grid flex-1 gap-4 sm:grid-cols-3">
                    <Controller
                        name={`members.${index}.name`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Member name"
                                    />
                                </InputGroup>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name={`members.${index}.role`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="w-full">
                                        <SelectValue>
                                            {roleOptions.find((option) => option.value === field.value)?.label}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent alignItemWithTrigger={false}>
                                        {roleOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name={`members.${index}.email`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Student email</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        {...field}
                                        id={field.name}
                                        type="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="u...@ms.kbu.ac.th"
                                    />
                                </InputGroup>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
            </div>
        </FieldGroup>
    );
}
