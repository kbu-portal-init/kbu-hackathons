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
import { formatRole } from "@/lib/util";
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
            toast.success("Registration approved. Password setup link sent to leader");
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
                        className={
                            statusFilter === s
                                ? "rounded-none border-2 border-brand-ink bg-brand-ink font-display text-xs font-semibold text-brand-paper hover:bg-brand-ink"
                                : "rounded-none border-2 border-brand-ink/20 font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow"
                        }
                        onClick={() => handleFilterChange(s)}
                    >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                    </Button>
                ))}
            </div>

            <div className="mt-4 rounded-none border-2 border-brand-ink bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Team
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Program
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Leader
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Members
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Status
                            </TableHead>
                            <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Submitted
                            </TableHead>
                            <TableHead className="text-right font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-brand-muted-foreground">
                                    No registrations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow className="hover:bg-brand-yellow/20" key={item.id}>
                                    <TableCell className="font-medium">{item.teamName}</TableCell>
                                    <TableCell>{formatRole(item.program)}</TableCell>
                                    <TableCell>{item.leaderName || "Not set"}</TableCell>
                                    <TableCell>{item.memberCount}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell>
                                        {item.submittedAt
                                            ? format(new Date(item.submittedAt), "MMM d, yyyy")
                                            : "Not submitted"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-none border-2 border-brand-ink font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow hover:text-brand-ink"
                                                onClick={() => router.push(`/panel/registrations/${item.id}`)}
                                            >
                                                <Eye className="size-4" />
                                                View
                                            </Button>
                                            {item.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="rounded-none border-2 border-brand-ink bg-brand-ink font-display text-xs font-semibold text-brand-paper hover:bg-brand-yellow hover:text-brand-ink"
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
                <DialogContent className="rounded-none border-2 border-brand-ink">
                    <DialogHeader>
                        <DialogTitle className="font-display">Reject registration</DialogTitle>
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
                                        <FieldLabel
                                            className="font-display text-sm font-semibold text-brand-ink"
                                            htmlFor={field.name}
                                        >
                                            Reason
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Explain why this registration was rejected..."
                                            className="rounded-none border-2 border-brand-ink/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <DialogFooter className="mt-4 border-t-2 border-brand-ink/15 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectItem(null)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={isPending}
                                className="rounded-none border-2 border-destructive/40 font-display text-sm font-semibold"
                            >
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
                    className="rounded-none border-2 border-brand-ink bg-brand-yellow text-brand-ink"
                >
                    Pending
                </Badge>
            );
        case "APPROVED":
            return (
                <Badge variant="outline" className="rounded-none border-2 border-brand-ink text-brand-ink">
                    Approved
                </Badge>
            );
        case "REJECTED":
            return (
                <Badge variant="destructive" className="rounded-none border-2 border-destructive/40">
                    Rejected
                </Badge>
            );
        default:
            return (
                <Badge
                    variant="secondary"
                    className="rounded-none border-2 border-brand-ink/15 text-brand-muted-foreground"
                >
                    {status}
                </Badge>
            );
    }
}
