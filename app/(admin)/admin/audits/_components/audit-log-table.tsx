"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteAuditLog } from "@/actions/admin/audits";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                No audit logs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="whitespace-nowrap">
                                    {new Date(item.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {item.actor ? (
                                        <>
                                            <div>{item.actor.name}</div>
                                            <div className="text-xs text-zinc-500">{item.actor.email}</div>
                                        </>
                                    ) : (
                                        "System"
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{item.action}</TableCell>
                                <TableCell>
                                    {item.targetType} <span className="text-xs text-zinc-500">{item.targetId}</span>
                                </TableCell>
                                <TableCell className="max-w-72 whitespace-pre-wrap wrap-break-word text-sm text-zinc-500">
                                    {item.details == null ? "—" : JSON.stringify(item.details)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ConfirmActionDialog
                                        trigger={
                                            <Button variant="destructive" size="sm" disabled={deletingId !== null}>
                                                Delete
                                            </Button>
                                        }
                                        title="Delete audit log"
                                        description={`Permanently delete the ${item.action} audit record? This cannot be undone.`}
                                        confirmLabel="Delete"
                                        pendingLabel="Deleting..."
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
