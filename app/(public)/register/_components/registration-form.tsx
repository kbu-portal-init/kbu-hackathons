"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitTeamRegistration } from "@/actions/management/registrations";
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
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitRegistrationSchema } from "@/lib/contracts/registration";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Role =
    | "LEADER"
    | "DEVELOPER"
    | "DESIGNER"
    | "PRODUCT_MANAGER"
    | "MARKETER"
    | "PRESENTER"
    | "RESEARCHER"
    | "TESTER"
    | "OTHER";

type FormValues = {
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    leaderRole?: Role;
    members: { name: string; role: Role; email: string }[];
};

const roleOptions = [
    { value: "LEADER", label: "Leader" },
    { value: "DEVELOPER", label: "Developer" },
    { value: "DESIGNER", label: "Designer" },
    { value: "PRODUCT_MANAGER", label: "Product Manager" },
    { value: "MARKETER", label: "Marketer" },
    { value: "PRESENTER", label: "Presenter" },
    { value: "RESEARCHER", label: "Researcher" },
    { value: "TESTER", label: "Tester" },
    { value: "OTHER", label: "Other" },
] as const;

export function RegistrationForm({ minTeamSize, maxTeamSize }: { minTeamSize: number; maxTeamSize: number }) {
    const [submitted, setSubmitted] = useState(false);
    const maxAdditionalMembers = maxTeamSize - 1;

    const form = useForm<FormValues>({
        resolver: zodResolver(submitRegistrationSchema),
        defaultValues: {
            teamName: "",
            leaderName: "",
            leaderEmail: "",
            leaderRole: "LEADER" as Role,
            members: [] as { name: string; role: Role; email: string }[],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const teamSize = 1 + fields.length;

    const onSubmit = async (values: FormValues) => {
        const result = await submitTeamRegistration({ ...values, leaderRole: values.leaderRole ?? "LEADER" });
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, form.setError);
            toast.error(result.error.message);
            return;
        }
        toast.success("Registration submitted!");
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
                    Verification links have been sent to all team members. Once everyone verifies their email, your team
                    will be automatically approved and the leader will receive a login link.
                </p>
                <Button variant="outline" className="mt-8" onClick={() => setSubmitted(false)}>
                    Register another team
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Team Information */}
            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                <FieldSet>
                    <FieldLegend>Team information</FieldLegend>
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
                    </FieldGroup>
                </FieldSet>
            </div>

            {/* Team Leader */}
            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                <FieldSet>
                    <FieldLegend>Team leader</FieldLegend>
                    <FieldDescription>
                        The leader will receive the magic link to access the team dashboard.
                    </FieldDescription>
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
                                            placeholder="e.g. Jane Doe"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="leaderRole"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                        placeholder="e.g. jane@ms.kbu.ac.th"
                                    />
                                    <FieldDescription>Must be a valid @ms.kbu.ac.th email address.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </FieldSet>
            </div>

            {/* Team Members */}
            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 dark:border-orange-950 dark:bg-zinc-900 dark:shadow-none">
                <FieldSet>
                    <div className="flex items-center justify-between">
                        <FieldLegend>Team members</FieldLegend>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-zinc-500">
                                {teamSize} / {maxTeamSize} members
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={fields.length >= maxAdditionalMembers}
                                onClick={() => append({ name: "", role: "DEVELOPER", email: "" })}
                            >
                                <Plus className="size-4" />
                                Add member
                            </Button>
                        </div>
                    </div>
                    <FieldDescription>
                        Add your team members (excluding the leader). All members must verify their email.
                        {minTeamSize > 1 && ` Minimum team size is ${minTeamSize}.`}
                    </FieldDescription>

                    {fields.length === 0 && (
                        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
                            No members added yet. Click &quot;Add member&quot; to begin.
                        </p>
                    )}

                    <FieldGroup className="gap-3">
                        {fields.map((field, index) => (
                            <MemberRow
                                key={field.id}
                                index={index}
                                control={form.control}
                                onRemove={() => remove(index)}
                            />
                        ))}
                    </FieldGroup>
                </FieldSet>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-40">
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
        </form>
    );
}

function MemberRow({
    index,
    control,
    onRemove,
}: {
    index: number;
    control: ReturnType<typeof useForm<FormValues>>["control"];
    onRemove: () => void;
}) {
    return (
        <FieldGroup>
            <div className="flex gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex-1 grid gap-4 sm:grid-cols-3">
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
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                        placeholder="e.g. name@ms.kbu.ac.th"
                                    />
                                </InputGroup>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <div className="flex items-start pt-7">
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={onRemove}
                            aria-label={`Remove member ${index + 1}`}
                        >
                            <Trash2 className="size-3.5" />
                        </InputGroupButton>
                    </InputGroupAddon>
                </div>
            </div>
        </FieldGroup>
    );
}
