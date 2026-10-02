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
        <div className="rounded-2xl border border-zinc-200 bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No announcements found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="relative size-14 overflow-hidden rounded-lg border bg-muted">
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
                                    {item.publishedAt ? format(new Date(item.publishedAt), "MMM d, yyyy") : "—"}
                                </TableCell>

                                <TableCell>{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>

                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        {item.status === "PUBLISHED" && (
                                            <Link
                                                href={`/announcements/${item.id}`}
                                                className={buttonVariants({ variant: "outline", size: "sm" })}
                                            >
                                                View
                                            </Link>
                                        )}

                                        {item.status === "DRAFT" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                    disabled={isPending}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => onPublish(item.id)}
                                                    disabled={isPending}
                                                >
                                                    Publish
                                                </Button>

                                                <ConfirmActionAlertDialog
                                                    trigger={
                                                        <Button variant="destructive" size="sm" disabled={isPending}>
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
                                                    onClick={() => onEdit(item)}
                                                    disabled={isPending}
                                                >
                                                    Edit
                                                </Button>

                                                <ConfirmActionAlertDialog
                                                    trigger={
                                                        <Button variant="outline" size="sm" disabled={isPending}>
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
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                    Draft
                </Badge>
            );

        case "PUBLISHED":
            return (
                <Badge variant="outline" className="border-green-300 text-green-700">
                    Published
                </Badge>
            );

        case "ARCHIVED":
            return <Badge variant="secondary">Archived</Badge>;

        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}
