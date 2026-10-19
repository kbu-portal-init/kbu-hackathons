"use client";

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnnouncementDTO } from "@/lib/contracts/announcements";

type Props = {
    items: AnnouncementDTO[];
    isPending: boolean;
    onEdit: (announcement: AnnouncementDTO) => void;
    onPublish: (id: string) => void;
    onArchive: (id: string) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
};

export function AnnouncementTable({ items, isPending, onEdit, onPublish, onArchive, onDelete }: Props) {
    return (
        <div className="rounded-none border-2 border-brand-ink bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                            Image
                        </TableHead>
                        <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                            Title
                        </TableHead>
                        <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                            Status
                        </TableHead>
                        <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                            Published
                        </TableHead>
                        <TableHead className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                            Created
                        </TableHead>
                        <TableHead className="text-right font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted-foreground">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-brand-muted-foreground">
                                No announcements found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow className="hover:bg-brand-yellow/20" key={item.id}>
                                <TableCell>
                                    <div className="relative size-14 overflow-hidden rounded-none border-2 border-brand-ink bg-muted">
                                        <Image
                                            src={item.imageUrl ?? "/images/kbu.webp"}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    </div>
                                </TableCell>

                                <TableCell className="max-w-md font-medium">
                                    <div className="truncate">{item.title}</div>
                                </TableCell>

                                <TableCell>
                                    <StatusBadge status={item.status} />
                                </TableCell>

                                <TableCell>
                                    {item.publishedAt
                                        ? format(new Date(item.publishedAt), "MMM d, yyyy")
                                        : "Not published"}
                                </TableCell>

                                <TableCell>{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>

                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        {item.status === "PUBLISHED" && (
                                            <Link
                                                href={`/announcements/${item.id}`}
                                                className={buttonVariants({
                                                    variant: "outline",
                                                    size: "sm",
                                                    className:
                                                        "rounded-none border-2 border-brand-ink font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow hover:text-brand-ink",
                                                })}
                                            >
                                                View
                                            </Link>
                                        )}

                                        {item.status === "DRAFT" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-none border-2 border-brand-ink/20 font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow hover:text-brand-ink"
                                                    onClick={() => onEdit(item)}
                                                    disabled={isPending}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="rounded-none border-2 border-brand-ink bg-brand-ink font-display text-xs font-semibold text-brand-paper hover:bg-brand-yellow hover:text-brand-ink"
                                                    onClick={() => onPublish(item.id)}
                                                    disabled={isPending}
                                                >
                                                    Publish
                                                </Button>

                                                <ConfirmActionAlertDialog
                                                    trigger={
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="rounded-none border-2 border-destructive/40 font-display text-xs font-semibold"
                                                            disabled={isPending}
                                                        >
                                                            Delete
                                                        </Button>
                                                    }
                                                    title="Delete announcement?"
                                                    description="This action cannot be undone. The draft announcement will be permanently deleted."
                                                    confirmLabel="Delete"
                                                    pendingLabel="Deleting..."
                                                    onConfirm={() => onDelete(item.id)}
                                                />
                                            </>
                                        )}

                                        {item.status === "PUBLISHED" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-none border-2 border-brand-ink/20 font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow hover:text-brand-ink"
                                                    onClick={() => onEdit(item)}
                                                    disabled={isPending}
                                                >
                                                    Edit
                                                </Button>

                                                <ConfirmActionAlertDialog
                                                    trigger={
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-none border-2 border-brand-ink/20 font-display text-xs font-semibold text-brand-ink hover:bg-brand-yellow"
                                                            disabled={isPending}
                                                        >
                                                            Archive
                                                        </Button>
                                                    }
                                                    title="Archive announcement?"
                                                    description="The announcement will no longer be publicly visible after it is archived."
                                                    confirmLabel="Archive"
                                                    pendingLabel="Archiving..."
                                                    onConfirm={() => onArchive(item.id)}
                                                />
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
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "DRAFT":
            return (
                <Badge
                    variant="outline"
                    className="rounded-none border-2 border-brand-ink bg-brand-yellow text-brand-ink"
                >
                    Draft
                </Badge>
            );

        case "PUBLISHED":
            return (
                <Badge variant="outline" className="rounded-none border-2 border-brand-ink text-brand-ink">
                    Published
                </Badge>
            );

        case "ARCHIVED":
            return (
                <Badge
                    variant="secondary"
                    className="rounded-none border-2 border-brand-ink/15 text-brand-muted-foreground"
                >
                    Archived
                </Badge>
            );

        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}
