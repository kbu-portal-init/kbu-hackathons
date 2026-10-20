"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitTeamRegistration } from "@/actions/management/registrations";
import { BackButton } from "@/components/back-button";
import { PosterPanel } from "@/components/poster";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TeamMemberRole } from "@/generated/prisma/enums";
import { submitRegistrationSchema } from "@/lib/contracts/registration";
import { getMessages } from "@/lib/i18n/messages";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";
import { AcknowledgmentDialog } from "./acknowledgment-dialog";
import { MemberRow } from "./member-row";
import { ProgramPicker } from "./program-picker";
import { RosterSummary } from "./roster-summary";
import { SectionHeading } from "./section-heading";
import { TeamSizeStepper } from "./team-size-stepper";
import type { FormValues, Locale, ProgramSlot, SubmittedFormValues } from "./types";

export function RegistrationForm({
    minTeamSize,
    maxTeamSize,
    programSlots,
    locale,
}: {
    minTeamSize: number;
    maxTeamSize: number;
    programSlots: ProgramSlot[];
    locale: Locale;
}) {
    const t = getMessages(locale).register;
    const th = locale === "th";
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

    const changeTeamSize = (nextTeamSize: number) => {
        if (nextTeamSize === selectedTeamSize) return;

        const targetMembers = Math.max(0, nextTeamSize - 1);
        const currentMembers = form.getValues("members")?.length ?? 0;

        if (targetMembers > currentMembers) {
            // Add only the new empty rows; existing rows keep their typed values
            for (let i = currentMembers; i < targetMembers; i++) {
                append({ name: "", role: TeamMemberRole.DEVELOPER, email: "" }, { shouldFocus: false });
            }
        } else if (targetMembers < currentMembers) {
            // Remove only the rows at the end
            remove(Array.from({ length: currentMembers - targetMembers }, (_, i) => targetMembers + i));
        }

        setSelectedTeamSize(nextTeamSize);
    };

    const onSubmit = async (values: SubmittedFormValues) => {
        if (!acknowledged) {
            setInformationOpen(true);
            return;
        }
        await completeSubmission(values);
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
        toast.success(result.data.verificationEmailsSent ? t.submitted : t.verificationFailed);
        setVerificationEmailsSent(result.data.verificationEmailsSent);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="mx-auto max-w-xl border-2 border-border bg-card p-8 text-center">
                <div className="mx-auto flex size-14 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                    <CheckCircle2 className="size-7" />
                </div>
                <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">{t.submitted}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {verificationEmailsSent ? t.verificationSent : t.verificationFailed}
                </p>
                <BackButton fallbackHref="/" label="Back to home" className="mt-8" useHistory={false} />
            </div>
        );
    }

    const rosterNames = [watchedLeaderName ?? "", ...(watchedMembers ?? []).map((m) => m?.name ?? "")];

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <div className="space-y-6">
                    {/* 1 · Team */}
                    <PosterPanel className="p-6">
                        <SectionHeading
                            step={1}
                            title={th ? "ข้อมูลทีม" : "About your team"}
                            hint={th ? "ตั้งชื่อทีมและเลือกหลักสูตร" : "Name your team and pick your program."}
                        />
                        <FieldSet className="mt-6">
                            <FieldGroup>
                                <Controller
                                    name="teamName"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>{th ? "ชื่อทีม" : "Team name"}</FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="e.g. Byte Builders"
                                                className="h-11 border-2 border-border/25 bg-card text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                            />
                                            <FieldDescription>{t.uniqueTeamName}</FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="program"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel id="program-label">
                                                {th ? "หลักสูตรการศึกษา" : "Education program"}
                                            </FieldLabel>
                                            <ProgramPicker
                                                name={field.name}
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                invalid={fieldState.invalid}
                                                slots={programSlots}
                                                labelledBy="program-label"
                                                locale={locale}
                                            />
                                            <FieldDescription>{t.programDescription}</FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <Field>
                                    <FieldLabel id="team-size-label">{th ? "ขนาดทีม" : "Team size"}</FieldLabel>
                                    <TeamSizeStepper
                                        value={selectedTeamSize}
                                        min={minTeamSize}
                                        max={maxTeamSize}
                                        onChange={changeTeamSize}
                                        labelledBy="team-size-label"
                                        locale={locale}
                                    />
                                    <FieldDescription>
                                        {t.teamSizeHelp} {minTeamSize} and {maxTeamSize} {t.totalMembers}
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </PosterPanel>

                    {/* 2 · Leader */}
                    <PosterPanel className="p-6">
                        <SectionHeading
                            step={2}
                            title={th ? "หัวหน้าทีม" : "Team leader"}
                            hint={th ? "หัวหน้าทีมจะเป็นผู้ติดต่อหลักของทีม" : "Your leader is the main contact for the team."}
                        />
                        <FieldSet className="mt-6">
                            <FieldGroup>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Controller
                                        name="leaderName"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    {th ? "ชื่อเต็ม" : "Full name"}
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="Jane Doe"
                                                    className="h-11 border-2 border-border/25 bg-card text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Field>
                                        <FieldLabel>{t.role}</FieldLabel>
                                        <div className="flex h-11 items-center border-2 border-border/15 bg-background px-3 text-base text-muted-foreground">
                                            {t.leaderRole}
                                        </div>
                                    </Field>
                                </div>
                                <Controller
                                    name="leaderEmail"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                {th ? "อีเมลนักศึกษา" : "Student email"}
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="email"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="u...@ms.kbu.ac.th"
                                                className="h-11 border-2 border-border/25 bg-card text-base focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                            />
                                            <FieldDescription>{t.validStudentEmail}</FieldDescription>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
                    </PosterPanel>

                    {/* 3 · Members */}
                    <PosterPanel className="p-6">
                        <SectionHeading
                            step={3}
                            title={`${th ? "สมาชิกทีมคนอื่น ๆ" : "Other team members"} (${selectedTeamSize - 1})`}
                            hint={
                                th ? "เปลี่ยนจำนวนสมาชิกได้ที่ขนาดทีมด้านบน" : "Change the number of rows with team size above."
                            }
                        />
                        <FieldSet className="mt-6">
                            <FieldGroup className="gap-4">
                                {fields.map((field, index) => (
                                    <MemberRow key={field.id} index={index} control={form.control} locale={locale} />
                                ))}
                            </FieldGroup>
                        </FieldSet>
                    </PosterPanel>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24">
                    <RosterSummary
                        teamName={watchedTeamName}
                        program={watchedProgram}
                        names={rosterNames}
                        teamSize={selectedTeamSize}
                        locale={locale}
                    />

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="default"
                            type="submit"
                            size="lg"
                            disabled={form.formState.isSubmitting || !acknowledged}
                            className="h-12 w-full border-2 border-border bg-foreground font-display text-base font-semibold text-background hover:border-border hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {t.submitting}
                                </>
                            ) : (
                                t.submitRegistration
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            size="lg"
                            className="w-full border-2 border-border bg-card font-display text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={() => setInformationOpen(true)}
                        >
                            {acknowledged ? (
                                <>
                                    <CheckCircle2 className="size-4 text-primary" />
                                    {th ? "อ่านข้อมูลแล้ว" : "Read and acknowledged"}
                                </>
                            ) : (
                                t.readBeforeSubmit
                            )}
                        </Button>
                        {!acknowledged ? (
                            <p className="text-center text-sm leading-5 text-muted-foreground">
                                {th
                                    ? "อ่านและยืนยันข้อมูลก่อน จึงจะส่งใบสมัครได้"
                                    : "Read and confirm the info first to unlock submit."}
                            </p>
                        ) : null}
                    </div>
                </aside>
            </div>

            <AcknowledgmentDialog
                open={informationOpen}
                onOpenChange={setInformationOpen}
                acknowledged={acknowledged}
                onAcknowledgedChange={setAcknowledged}
                locale={locale}
            />
        </form>
    );
}
