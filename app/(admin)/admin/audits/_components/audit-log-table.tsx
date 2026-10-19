"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteAuditLog } from "@/actions/admin/audits";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import { PosterButton, PosterTableHead } from "@/components/poster";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLogListItem } from "@/lib/contracts/audits";

export function AuditLogTable({ items }: { items: AuditLogListItem[] }) {
    const router = useRouter();

    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function onDelete(item: AuditLogListItem) {
        setDeletingId(item.id);
        const result = await deleteAuditLog({ id: item.id });
        setDeletingId(null);
        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }
        toast.success("Audit log deleted");
        router.refresh();
    }
    return (
        <div className="overflow-x-auto border-2 border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Created
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Actor
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Action
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Target
                        </PosterTableHead>
                        <PosterTableHead className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Details
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
                                No audit logs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow className="hover:bg-accent/20" key={item.id}>
                                <TableCell className="whitespace-nowrap">
                                    {new Date(item.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {item.actor ? (
                                        <>
                                            <div>{item.actor.name}</div>
                                            <div className="text-xs text-muted-foreground">{item.actor.email}</div>
                                        </>
                                    ) : (
                                        "System"
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{item.action}</TableCell>
                                <TableCell>
                                    {item.targetType}{" "}
                                    <span className="text-xs text-muted-foreground">{item.targetId}</span>
                                </TableCell>
                                <TableCell className="max-w-72 whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
                                    {item.details == null ? "None" : JSON.stringify(item.details)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ConfirmActionAlertDialog
                                        trigger={
                                            <PosterButton
                                                tone="destructive"
                                                size="sm"
                                                className="border-2 border-destructive/40 font-display text-xs font-semibold"
                                                disabled={deletingId !== null}
                                            >
                                                Delete
                                            </PosterButton>
                                        }
                                        title="Delete audit log"
                                        description={`Permanently delete the ${item.action} audit record? This cannot be undone.`}
                                        confirmLabel="Delete"
                                        pendingLabel="Deleting..."
                                        destructive
                                        onConfirm={() => onDelete(item)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
