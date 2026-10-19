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
import {
    PosterBadge,
    PosterButton,
    PosterDialogContent,
    PosterDialogFooter,
    PosterFieldLabel,
    PosterTableHead,
    PosterTextarea,
} from "@/components/poster";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
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
                    <PosterButton
                        key={s}
                        tone={statusFilter === s ? "solid" : "outline"}
                        size="sm"
                        className={
                            statusFilter === s
                                ? "border-2 border-border bg-foreground font-display text-xs font-semibold text-background hover:bg-foreground"
                                : "border-2 border-border/20 font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                        }
                        onClick={() => handleFilterChange(s)}
                    >
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                    </PosterButton>
                ))}
            </div>

            <div className="mt-4 border-2 border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Team
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Program
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Leader
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Members
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Status
                            </PosterTableHead>
                            <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Submitted
                            </PosterTableHead>
                            <PosterTableHead className="text-right font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Actions
                            </PosterTableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No registrations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow className="hover:bg-accent/20" key={item.id}>
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
                                            <PosterButton
                                                tone="outline"
                                                size="sm"
                                                className="border-2 border-border font-display text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
                                                onClick={() => router.push(`/panel/registrations/${item.id}`)}
                                            >
                                                <Eye className="size-4" />
                                                View
                                            </PosterButton>
                                            {item.status === "PENDING" && (
                                                <>
                                                    <PosterButton
                                                        tone="solid"
                                                        size="sm"
                                                        className="border-2 border-border bg-foreground font-display text-xs font-semibold text-background hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => onApprove(item.id)}
                                                        disabled={isPending}
                                                    >
                                                        Approve
                                                    </PosterButton>
                                                    <PosterButton
                                                        tone="destructive"
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
                                                    </PosterButton>
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
                <PosterDialogContent className="border-2 border-border">
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
                                        <PosterFieldLabel
                                            className="font-display text-sm font-semibold text-foreground"
                                            htmlFor={field.name}
                                        >
                                            Reason
                                        </PosterFieldLabel>
                                        <PosterTextarea
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Explain why this registration was rejected..."
                                            className="border-2 border-border/25 bg-card focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <PosterDialogFooter className="mt-4 border-t-2 border-border/15 pt-4">
                            <PosterButton
                                tone="outline"
                                type="button"
                                onClick={() => setRejectItem(null)}
                                disabled={isPending}
                            >
                                Cancel
                            </PosterButton>
                            <PosterButton
                                tone="destructive"
                                type="submit"
                                disabled={isPending}
                                className="border-2 border-destructive/40 font-display text-sm font-semibold"
                            >
                                {isPending ? "Rejecting..." : "Reject registration"}
                            </PosterButton>
                        </PosterDialogFooter>
                    </form>
                </PosterDialogContent>
            </Dialog>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PENDING":
            return (
                <PosterBadge tone="accent" className="border-2 border-border bg-accent text-accent-foreground">
                    Pending
                </PosterBadge>
            );
        case "APPROVED":
            return (
                <PosterBadge tone="neutral" className="border-2 border-border text-foreground">
                    Approved
                </PosterBadge>
            );
        case "REJECTED":
            return (
                <PosterBadge tone="danger" className="border-2 border-destructive/40">
                    Rejected
                </PosterBadge>
            );
        default:
            return (
                <PosterBadge tone="muted" className="border-2 border-border/15 text-muted-foreground">
                    {status}
                </PosterBadge>
            );
    }
}
