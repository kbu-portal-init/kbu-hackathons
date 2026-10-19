"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { banAccount, unbanAccount } from "@/actions/admin/accounts";
import { createOrganizer, updateOrganizer } from "@/actions/admin/organizers";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import {
    PosterButton,
    PosterDialogContent,
    PosterDialogFooter,
    PosterFieldLabel,
    PosterInput,
    PosterTableHead,
} from "@/components/poster";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { type BanAccountFormInput, type BanAccountInput, banAccountSchema } from "@/lib/contracts/accounts";
import {
    type CreateOrganizerInput,
    createOrganizerSchema,
    type OrganizerListItem,
    type UpdateOrganizerInput,
    updateOrganizerSchema,
} from "@/lib/contracts/organizers";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Props = { items: OrganizerListItem[] };

export function OrganizerManagement({ items }: Props) {
    const router = useRouter();

    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<OrganizerListItem | null>(null);
    const [banItem, setBanItem] = useState<OrganizerListItem | null>(null);
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    const createForm = useForm<CreateOrganizerInput>({
        resolver: zodResolver(createOrganizerSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const editForm = useForm<UpdateOrganizerInput>({
        resolver: zodResolver(updateOrganizerSchema),
        defaultValues: { userId: "", name: "", email: "" },
    });

    const banForm = useForm<BanAccountFormInput, unknown, BanAccountInput>({
        resolver: zodResolver(banAccountSchema),
        defaultValues: { userId: "", reason: "", expiresAt: null },
    });

    const onCreate = async (values: CreateOrganizerInput) => {
        const result = await createOrganizer(values);
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, createForm.setError);
            toast.error(result.error.message);
            return;
        }
        toast.success("Organizer created");
        setCreateOpen(false);
        createForm.reset();
        router.refresh();
    };

    const onEdit = async (values: UpdateOrganizerInput) => {
        const result = await updateOrganizer(values);
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, editForm.setError);
            toast.error(result.error.message);
            return;
        }
        toast.success("Organizer updated");
        setEditItem(null);
        router.refresh();
    };

    const onBan = async (values: BanAccountInput) => {
        const result = await banAccount(values);
        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, banForm.setError);
            toast.error(result.error.message);
            return;
        }
        toast.success("Organizer banned");
        setBanItem(null);
        banForm.reset();
        router.refresh();
    };

    const onUnban = async (item: OrganizerListItem) => {
        const result = await unbanAccount({ userId: item.id });
        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }
        toast.success("Organizer unbanned");
        router.refresh();
    };

    return (
        <>
            <div className="flex justify-end">
                <PosterButton
                    tone="solid"
                    className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                        createForm.reset();
                        setCreateOpen(true);
                    }}
                >
                    Create organizer
                </PosterButton>
            </div>
            <OrganizerTable
                items={items}
                onEdit={(item) => {
                    editForm.reset({ userId: item.id, name: item.name, email: item.email });
                    setEditItem(item);
                }}
                onBan={(item) => {
                    banForm.reset({ userId: item.id, reason: "", expiresAt: null });
                    setBanItem(item);
                }}
                onUnban={onUnban}
            />
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <PosterDialogContent className="border-2 border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display">Create organizer</DialogTitle>
                        <DialogDescription>Create an email-verified organizer account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createForm.handleSubmit(onCreate)}>
                        <FieldGroup>
                            <Controller
                                name="name"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <PosterFieldLabel
                                            htmlFor={field.name}
                                            className="font-display text-sm font-semibold text-foreground"
                                        >
                                            Name
                                        </PosterFieldLabel>
                                        <PosterInput
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="email"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <PosterFieldLabel
                                            htmlFor={field.name}
                                            className="font-display text-sm font-semibold text-foreground"
                                        >
                                            Email
                                        </PosterFieldLabel>
                                        <PosterInput
                                            {...field}
                                            id={field.name}
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="password"
                                control={createForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <PosterFieldLabel
                                            htmlFor={field.name}
                                            className="font-display text-sm font-semibold text-foreground"
                                        >
                                            Password
                                        </PosterFieldLabel>
                                        <div className="relative">
                                            <PosterInput
                                                {...field}
                                                id={field.name}
                                                type={showCreatePassword ? "text" : "password"}
                                                className="pr-10"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <PosterButton
                                                tone="ghost"
                                                type="button"
                                                size="icon-sm"
                                                className="absolute inset-y-1 right-1"
                                                aria-label={showCreatePassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowCreatePassword((current) => !current)}
                                            >
                                                {showCreatePassword ? <EyeOff /> : <Eye />}
                                            </PosterButton>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <PosterDialogFooter className="mt-4 border-t-2 border-border/15 pt-4">
                            <PosterButton
                                tone="solid"
                                type="submit"
                                disabled={createForm.formState.isSubmitting}
                                className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                            >
                                {createForm.formState.isSubmitting ? "Creating..." : "Create"}
                            </PosterButton>
                        </PosterDialogFooter>
                    </form>
                </PosterDialogContent>
            </Dialog>
            <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
                <PosterDialogContent className="border-2 border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display">Edit organizer</DialogTitle>
                        <DialogDescription>Update the organizer’s name and email address.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editForm.handleSubmit(onEdit)}>
                        <FieldGroup>
                            <Controller
                                name="name"
                                control={editForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <PosterFieldLabel
                                            htmlFor={field.name}
                                            className="font-display text-sm font-semibold text-foreground"
                                        >
                                            Name
                                        </PosterFieldLabel>
                                        <PosterInput
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="email"
                                control={editForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <PosterFieldLabel
                                            htmlFor={field.name}
                                            className="font-display text-sm font-semibold text-foreground"
                                        >
                                            Email
                                        </PosterFieldLabel>
                                        <PosterInput
                                            {...field}
                                            id={field.name}
                                            type="email"
                                            aria-invalid={fieldState.invalid}
                                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <PosterDialogFooter className="mt-4 border-t-2 border-border/15 pt-4">
                            <PosterButton
                                tone="solid"
                                type="submit"
                                disabled={editForm.formState.isSubmitting}
                                className="border-2 border-border bg-foreground font-display text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                            >
                                {editForm.formState.isSubmitting ? "Saving..." : "Save changes"}
                            </PosterButton>
                        </PosterDialogFooter>
                    </form>
                </PosterDialogContent>
            </Dialog>
            <Dialog open={!!banItem} onOpenChange={(open) => !open && setBanItem(null)}>
                <PosterDialogContent className="border-2 border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display">Ban organizer</DialogTitle>
                        <DialogDescription>
                            This revokes all current sessions. Leave expiry empty for a permanent ban.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={banForm.handleSubmit(onBan)}>
                        <FieldGroup>
                            <Controller
                                name="reason"
                                control={banForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <PosterFieldLabel
                                            htmlFor={field.name}
                                            className="font-display text-sm font-semibold text-foreground"
                                        >
                                            Reason
                                        </PosterFieldLabel>
                                        <PosterInput
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                control={banForm.control}
                                name="expiresAt"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <BanExpiryField
                                            value={field.value instanceof Date ? field.value : null}
                                            onChange={field.onChange}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <PosterDialogFooter className="mt-4 border-t-2 border-border/15 pt-4">
                            <PosterButton
                                tone="destructive"
                                type="submit"
                                disabled={banForm.formState.isSubmitting}
                                className="border-2 border-destructive/40 font-display text-sm font-semibold"
                            >
                                {banForm.formState.isSubmitting ? "Banning..." : "Confirm ban"}
                            </PosterButton>
                        </PosterDialogFooter>
                    </form>
                </PosterDialogContent>
            </Dialog>
        </>
    );
}

function OrganizerTable({
    items,
    onEdit,
    onBan,
    onUnban,
}: {
    items: OrganizerListItem[];
    onEdit: (item: OrganizerListItem) => void;
    onBan: (item: OrganizerListItem) => void;
    onUnban: (item: OrganizerListItem) => Promise<void>;
}) {
    return (
        <div className="border-2 border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Name
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Email
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Created
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Status
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Ban details
                        </PosterTableHead>
                        <PosterTableHead className="text-right font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Actions
                        </PosterTableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No organizers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow className="hover:bg-accent/20" key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span
                                        className={
                                            item.banned
                                                ? "inline-flex border-2 border-destructive/40 px-2 py-0.5 font-display text-xs font-semibold text-destructive"
                                                : "inline-flex border-2 border-border px-2 py-0.5 font-display text-xs font-semibold text-foreground"
                                        }
                                    >
                                        {item.banned ? "Banned" : "Active"}
                                    </span>
                                </TableCell>
                                <TableCell className="max-w-56 whitespace-normal text-sm text-muted-foreground">
                                    {item.banned ? (
                                        <>
                                            {item.banReason ?? "No reason"}
                                            {item.banExpires
                                                ? ` · until ${new Date(item.banExpires).toLocaleString()}`
                                                : " · permanent"}
                                        </>
                                    ) : (
                                        "None"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <PosterButton
                                            tone="outline"
                                            size="sm"
                                            className="border-2 border-border/20 font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => onEdit(item)}
                                        >
                                            Edit
                                        </PosterButton>
                                        {item.banned ? (
                                            <ConfirmActionAlertDialog
                                                trigger={
                                                    <PosterButton
                                                        tone="outline"
                                                        size="sm"
                                                        className="border-2 border-border/20 font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                                                    >
                                                        Unban
                                                    </PosterButton>
                                                }
                                                title="Unban organizer"
                                                description="Restore this organizer account access?"
                                                confirmLabel="Unban"
                                                pendingLabel="Unbanning..."
                                                onConfirm={() => onUnban(item)}
                                            />
                                        ) : (
                                            <PosterButton
                                                tone="destructive"
                                                size="sm"
                                                className="border-2 border-destructive/40 font-display text-xs font-semibold"
                                                onClick={() => onBan(item)}
                                            >
                                                Ban
                                            </PosterButton>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function BanExpiryField({ value, onChange }: { value: Date | null; onChange: (value: Date | null) => void }) {
    const date = value ?? undefined;
    const time = value ? format(value, "HH:mm") : "23:59";
    return (
        <>
            <PosterFieldLabel className="font-display text-sm font-semibold text-foreground">
                Expires at
            </PosterFieldLabel>
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger
                        render={
                            <PosterButton
                                tone="outline"
                                type="button"
                                className="flex-1 justify-start border-2 border-border/25 bg-card font-normal text-foreground"
                            />
                        }
                    >
                        <CalendarIcon />
                        {date ? format(date, "PPP") : "Select a date"}
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) =>
                                onChange(selectedDate ? setExpiryTime(selectedDate, time) : null)
                            }
                            disabled={{ before: startOfToday() }}
                        />
                    </PopoverContent>
                </Popover>
                <PosterInput
                    type="time"
                    value={time}
                    onChange={(event) => value && onChange(setExpiryTime(value, event.target.value))}
                    disabled={!date}
                    aria-label="Ban expiry time"
                    className="w-28 border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                {date && (
                    <PosterButton tone="ghost" type="button" size="sm" onClick={() => onChange(null)}>
                        Clear
                    </PosterButton>
                )}
            </div>
            <FieldDescription>Leave the date empty for a permanent ban. The default time is 23:59.</FieldDescription>
        </>
    );
}

function setExpiryTime(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const expiry = new Date(date);
    expiry.setHours(hours, minutes, 0, 0);
    return expiry;
}
