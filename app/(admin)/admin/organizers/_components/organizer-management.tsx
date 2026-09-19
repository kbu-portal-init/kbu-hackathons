"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfToday } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { banAccount, unbanAccount } from "@/actions/admin/accounts";
import { createOrganizer, updateOrganizer } from "@/actions/admin/organizers";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

    const createForm = useForm<CreateOrganizerInput>({
        resolver: zodResolver(createOrganizerSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const editForm = useForm<UpdateOrganizerInput>({
        resolver: zodResolver(updateOrganizerSchema),
        defaultValues: { userId: "", name: "", email: "", password: undefined },
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
                <Button
                    onClick={() => {
                        createForm.reset();
                        setCreateOpen(true);
                    }}
                >
                    Create organizer
                </Button>
            </div>
            <OrganizerTable
                items={items}
                onEdit={(item) => {
                    editForm.reset({ userId: item.id, name: item.name, email: item.email, password: undefined });
                    setEditItem(item);
                }}
                onBan={(item) => {
                    banForm.reset({ userId: item.id, reason: "", expiresAt: null });
                    setBanItem(item);
                }}
                onUnban={onUnban}
            />
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create organizer</DialogTitle>
                        <DialogDescription>Create an email-verified organizer account.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
                        <TextField
                            label="Name"
                            error={createForm.formState.errors.name?.message}
                            inputProps={createForm.register("name")}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            error={createForm.formState.errors.email?.message}
                            inputProps={createForm.register("email")}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            error={createForm.formState.errors.password?.message}
                            inputProps={createForm.register("password")}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={createForm.formState.isSubmitting}>
                                {createForm.formState.isSubmitting ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit organizer</DialogTitle>
                        <DialogDescription>
                            Update account details. Leave password blank to keep it unchanged.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
                        <TextField
                            label="Name"
                            error={editForm.formState.errors.name?.message}
                            inputProps={editForm.register("name")}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            error={editForm.formState.errors.email?.message}
                            inputProps={editForm.register("email")}
                        />
                        <TextField
                            label="New password"
                            type="password"
                            error={editForm.formState.errors.password?.message}
                            inputProps={editForm.register("password", {
                                setValueAs: (value) => value || undefined,
                            })}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={editForm.formState.isSubmitting}>
                                {editForm.formState.isSubmitting ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={!!banItem} onOpenChange={(open) => !open && setBanItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban organizer</DialogTitle>
                        <DialogDescription>
                            This revokes all current sessions. Leave expiry empty for a permanent ban.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={banForm.handleSubmit(onBan)} className="space-y-4">
                        <TextField
                            label="Reason"
                            error={banForm.formState.errors.reason?.message}
                            inputProps={banForm.register("reason")}
                        />
                        <Controller
                            control={banForm.control}
                            name="expiresAt"
                            render={({ field }) => (
                                <BanExpiryField
                                    value={field.value instanceof Date ? field.value : null}
                                    onChange={field.onChange}
                                    error={banForm.formState.errors.expiresAt?.message}
                                />
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" variant="destructive" disabled={banForm.formState.isSubmitting}>
                                {banForm.formState.isSubmitting ? "Banning..." : "Confirm ban"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
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
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ban details</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                No organizers found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className={item.banned ? "text-red-600" : "text-emerald-600"}>
                                        {item.banned ? "Banned" : "Active"}
                                    </span>
                                </TableCell>
                                <TableCell className="max-w-56 whitespace-normal text-sm text-zinc-500">
                                    {item.banned ? (
                                        <>
                                            {item.banReason ?? "No reason"}
                                            {item.banExpires
                                                ? ` Â· until ${new Date(item.banExpires).toLocaleString()}`
                                                : " Â· permanent"}
                                        </>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                                            Edit
                                        </Button>
                                        {item.banned ? (
                                            <ConfirmActionDialog
                                                trigger={
                                                    <Button variant="outline" size="sm">
                                                        Unban
                                                    </Button>
                                                }
                                                title="Unban organizer"
                                                description="Restore this organizer account access?"
                                                confirmLabel="Unban"
                                                pendingLabel="Unbanning..."
                                                onConfirm={() => onUnban(item)}
                                            />
                                        ) : (
                                            <Button variant="destructive" size="sm" onClick={() => onBan(item)}>
                                                Ban
                                            </Button>
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

function BanExpiryField({
    value,
    onChange,
    error,
}: {
    value: Date | null;
    onChange: (value: Date | null) => void;
    error?: string;
}) {
    const date = value ?? undefined;
    const time = value ? format(value, "HH:mm") : "23:59";
    return (
        <div className="space-y-2">
            <Label>Expires at</Label>
            <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger
                        render={<Button type="button" variant="outline" className="flex-1 justify-start font-normal" />}
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
                <Input
                    type="time"
                    value={time}
                    onChange={(event) => value && onChange(setExpiryTime(value, event.target.value))}
                    disabled={!date}
                    aria-label="Ban expiry time"
                    className="w-28"
                />
                {date && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                        Clear
                    </Button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Leave the date empty for a permanent ban. The default time is 23:59.
            </p>
            <FormError message={error} />
        </div>
    );
}

function TextField({
    label,
    type = "text",
    error,
    inputProps,
}: {
    label: string;
    type?: string;
    error?: string;
    inputProps: ReturnType<ReturnType<typeof useForm>["register"]>;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input type={type} aria-invalid={!!error} {...inputProps} />
            <FormError message={error} />
        </div>
    );
}

function FormError({ message }: { message?: string }) {
    return message ? <p className="text-xs text-red-600">{message}</p> : null;
}

function setExpiryTime(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const expiry = new Date(date);
    expiry.setHours(hours, minutes, 0, 0);
    return expiry;
}
