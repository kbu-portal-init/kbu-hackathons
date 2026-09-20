"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { approveRegistrationRequest, rejectRegistrationRequest } from "@/actions/management/registrations";
import { PaginationFooter } from "@/components/pagination-footer";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { PaginationMeta } from "@/lib/contracts/common";
import {
    type RegistrationListItem,
    type RejectRegistrationInput,
    rejectRegistrationSchema,
} from "@/lib/contracts/registration";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Props = {
    items: RegistrationListItem[];
    meta: PaginationMeta;
    status?: "PENDING" | "APPROVED" | "REJECTED";
};

const statusFilters = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export function RegistrationManagement({ items, meta, status }: Props) {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">(status ?? "ALL");
    const [rejectItem, setRejectItem] = useState<RegistrationListItem | null>(null);
    const [isPending, startTransition] = useTransition();

    const rejectForm = useForm<RejectRegistrationInput>({
        resolver: zodResolver(rejectRegistrationSchema),
        defaultValues: { registrationId: "", reason: "" },
    });

    const onApprove = async (id: string) => {
        startTransition(async () => {
            const result = await approveRegistrationRequest({ registrationId: id });
            if (!result.ok) {
                toast.error(result.error.message);
                return;
            }
            toast.success("Registration approved — magic link sent to leader");
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
            setRejectItem(null);
            rejectForm.reset();
            router.refresh();
        });
    };

    const handleFilterChange = (status: "ALL" | "PENDING" | "APPROVED" | "REJECTED") => {
        setStatusFilter(status);
        const params = new URLSearchParams();
        if (status !== "ALL") params.set("status", status);
        params.set("page", "1");
        router.push(`/panel/registrations?${params.toString()}`);
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {statusFilters.map((s) => (
                    <Button
                        key={s}
                        variant={statusFilter === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange(s)}
                    >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                    </Button>
                ))}
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team</TableHead>
                            <TableHead>Leader</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                    No registrations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.teamName}</TableCell>
                                    <TableCell>{item.leaderName || "—"}</TableCell>
                                    <TableCell>{item.memberCount}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell>
                                        {item.submittedAt ? format(new Date(item.submittedAt), "MMM d, yyyy") : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/panel/registrations/${item.id}`)}
                                            >
                                                <Eye className="size-4" />
                                                View
                                            </Button>
                                            {item.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onApprove(item.id)}
                                                        disabled={isPending}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            rejectForm.reset({
                                                                registrationId: item.id,
                                                                reason: "",
                                                            });
                                                            setRejectItem(item);
                                                        }}
                                                        disabled={isPending}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationFooter
                page={meta.page}
                pageSize={meta.pageSize}
                total={meta.total}
                itemsShown={items.length}
                hasNextPage={meta.hasNextPage}
                getPageHref={(page) => {
                    const params = new URLSearchParams({ page: String(page), pageSize: String(meta.pageSize) });
                    if (status) params.set("status", status);
                    return `/panel/registrations?${params.toString()}`;
                }}
            />

            <Dialog open={!!rejectItem} onOpenChange={(open) => !open && setRejectItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject registration</DialogTitle>
                        <DialogDescription>
                            Rejecting &quot;{rejectItem?.teamName}&quot;. This action sends a rejection email to the
                            team leader.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={rejectForm.handleSubmit(onReject)}>
                        <FieldGroup>
                            <input type="hidden" {...rejectForm.register("registrationId")} />
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
                                onClick={() => setRejectItem(null)}
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

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PENDING":
            return (
                <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                >
                    Pending
                </Badge>
            );
        case "APPROVED":
            return (
                <Badge
                    variant="outline"
                    className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                >
                    Approved
                </Badge>
            );
        case "REJECTED":
            return <Badge variant="destructive">Rejected</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}
