"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    archiveAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    updateAnnouncement,
} from "@/actions/management/announcements";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
    type AnnouncementDTO,
    type CreateAnnouncementInput,
    CreateAnnouncementInputSchema,
    type UpdateAnnouncementInput,
    updateAnnouncementSchema,
} from "@/lib/contracts/announcements";
import type { PaginationMeta } from "@/lib/contracts/common";
import { handleActionError } from "@/lib/utils/action-error";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

type Props = {
    items: AnnouncementDTO[];
    meta: PaginationMeta;
};

const statusFilters = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const;

type StatusFilter = (typeof statusFilters)[number];

export function AnnouncementManagement({ items, meta }: Props) {
    const router = useRouter();

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const createForm = useForm<CreateAnnouncementInput>({
        resolver: zodResolver(CreateAnnouncementInputSchema),
        defaultValues: {
            title: "",
            content: "",
            imageUrl: "",
        },
    });

    const editForm = useForm<UpdateAnnouncementInput>({
        resolver: zodResolver(updateAnnouncementSchema),
        defaultValues: {
            announcementId: "",
            title: "",
            content: "",
            imageUrl: "",
        },
    });

    const handleFilterChange = (status: StatusFilter) => {
        setStatusFilter(status);

        const params = new URLSearchParams({
            page: "1",
            pageSize: String(meta.pageSize),
        });

        if (status !== "ALL") {
            params.set("status", status);
        }

        if (search.trim()) {
            params.set("search", search.trim());
        }

        router.push(`/panel/announcements?${params.toString()}`);
    };

    const handleSearch = () => {
        const params = new URLSearchParams({
            page: "1",
            pageSize: String(meta.pageSize),
        });

        if (statusFilter !== "ALL") {
            params.set("status", statusFilter);
        }

        if (search.trim()) {
            params.set("search", search.trim());
        }

        router.push(`/panel/announcements?${params.toString()}`);
    };

    const handleCreate = async (values: CreateAnnouncementInput) => {
        startTransition(async () => {
            try {
                const result = await createAnnouncement(values);

                if (!result.ok) {
                    applyActionFieldErrors(result.error.fieldErrors, createForm.setError);
                    toast.error(result.error.message);
                    return;
                }

                toast.success("Announcement created");
                createForm.reset();
                setCreateOpen(false);
                router.refresh();
            } catch (error) {
                handleActionError(error, "Failed to create announcement");
            }
        });
    };

    const handleUpdate = async (values: UpdateAnnouncementInput) => {
        startTransition(async () => {
            try {
                const result = await updateAnnouncement(values);

                if (!result.ok) {
                    applyActionFieldErrors(result.error.fieldErrors, editForm.setError);
                    toast.error(result.error.message);
                    return;
                }

                toast.success("Announcement updated");
                editForm.reset();
                setEditOpen(false);
                router.refresh();
            } catch (error) {
                handleActionError(error, "Failed to update announcement");
            }
        });
    };

    const handleEdit = (announcement: AnnouncementDTO) => {
        editForm.reset({
            announcementId: announcement.id,
            title: announcement.title,
            content: announcement.content,
            imageUrl: announcement.imageUrl ?? "",
        });

        setEditOpen(true);
    };

    const handlePublish = async (id: string) => {
        startTransition(async () => {
            try {
                const result = await publishAnnouncement({
                    announcementId: id,
                });

                if (!result.ok) {
                    toast.error(result.error.message);
                    return;
                }

                toast.success("Announcement published");
                router.refresh();
            } catch (error) {
                handleActionError(error, "Failed to publish announcement");
            }
        });
    };

    const handleArchive = async (id: string): Promise<boolean> => {
        try {
            const result = await archiveAnnouncement({
                announcementId: id,
            });

            if (!result.ok) {
                toast.error(result.error.message);
                return false;
            }

            toast.success("Announcement archived");
            router.refresh();

            return true;
        } catch (error) {
            return handleActionError(error, "Failed to archive announcement");
        }
    };

    const handleDelete = async (id: string): Promise<boolean> => {
        try {
            const result = await deleteAnnouncement({
                announcementId: id,
            });

            if (!result.ok) {
                toast.error(result.error.message);
                return false;
            }

            toast.success("Announcement deleted");
            router.refresh();

            return true;
        } catch (error) {
            return handleActionError(error, "Failed to delete announcement");
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleSearch();
                            }
                        }}
                        placeholder="Search announcements..."
                        className="w-64"
                    />

                    <Button variant="outline" size="sm" onClick={handleSearch} disabled={isPending}>
                        Search
                    </Button>

                    {statusFilters.map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange(status)}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>

                <Button onClick={() => setCreateOpen(true)} disabled={isPending}>
                    Create announcement
                </Button>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
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
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No announcements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
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
                                            {item.status === "DRAFT" && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(item)}
                                                        disabled={isPending}
                                                    >
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePublish(item.id)}
                                                        disabled={isPending}
                                                    >
                                                        Publish
                                                    </Button>

                                                    <ConfirmActionAlertDialog
                                                        trigger={
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                disabled={isPending}
                                                            >
                                                                Delete
                                                            </Button>
                                                        }
                                                        title="Delete announcement?"
                                                        description="This action cannot be undone. The draft announcement will be permanently deleted."
                                                        confirmLabel="Delete"
                                                        pendingLabel="Deleting..."
                                                        onConfirm={() => handleDelete(item.id)}
                                                    />
                                                </>
                                            )}

                                            {item.status === "PUBLISHED" && (
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
                                                    onConfirm={() => handleArchive(item.id)}
                                                />
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
                    const params = new URLSearchParams({
                        page: String(page),
                        pageSize: String(meta.pageSize),
                    });

                    if (statusFilter !== "ALL") {
                        params.set("status", statusFilter);
                    }

                    if (search.trim()) {
                        params.set("search", search.trim());
                    }

                    return `/panel/announcements?${params.toString()}`;
                }}
            />

            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open);

                    if (!open) {
                        createForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create announcement</DialogTitle>

                        <DialogDescription>
                            Create a new announcement. It will remain a draft until you publish it.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createForm.handleSubmit(handleCreate)}>
                        <FieldGroup>
                            <Field data-invalid={!!createForm.formState.errors.title}>
                                <FieldLabel htmlFor="announcement-title">Title</FieldLabel>

                                <Input
                                    id="announcement-title"
                                    {...createForm.register("title")}
                                    aria-invalid={!!createForm.formState.errors.title}
                                    placeholder="Enter announcement title"
                                />

                                {createForm.formState.errors.title && (
                                    <FieldError errors={[createForm.formState.errors.title]} />
                                )}
                            </Field>

                            <Field data-invalid={!!createForm.formState.errors.content}>
                                <FieldLabel htmlFor="announcement-content">Content</FieldLabel>

                                <Textarea
                                    id="announcement-content"
                                    {...createForm.register("content")}
                                    aria-invalid={!!createForm.formState.errors.content}
                                    placeholder="Write the announcement content..."
                                    rows={6}
                                />

                                {createForm.formState.errors.content && (
                                    <FieldError errors={[createForm.formState.errors.content]} />
                                )}
                            </Field>

                            <Field data-invalid={!!createForm.formState.errors.imageUrl}>
                                <FieldLabel htmlFor="announcement-image-url">
                                    Image URL <span className="font-normal text-zinc-500">(optional)</span>
                                </FieldLabel>

                                <Input
                                    id="announcement-image-url"
                                    {...createForm.register("imageUrl")}
                                    aria-invalid={!!createForm.formState.errors.imageUrl}
                                    placeholder="https://example.com/image.jpg"
                                />

                                {createForm.formState.errors.imageUrl && (
                                    <FieldError errors={[createForm.formState.errors.imageUrl]} />
                                )}
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating..." : "Create announcement"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                    setEditOpen(open);

                    if (!open) {
                        editForm.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit announcement</DialogTitle>

                        <DialogDescription>Update the announcement details.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={editForm.handleSubmit(handleUpdate)}>
                        <FieldGroup>
                            <Field data-invalid={!!editForm.formState.errors.title}>
                                <FieldLabel htmlFor="edit-announcement-title">Title</FieldLabel>

                                <Input
                                    id="edit-announcement-title"
                                    {...editForm.register("title")}
                                    aria-invalid={!!editForm.formState.errors.title}
                                    placeholder="Enter announcement title"
                                />

                                {editForm.formState.errors.title && (
                                    <FieldError errors={[editForm.formState.errors.title]} />
                                )}
                            </Field>

                            <Field data-invalid={!!editForm.formState.errors.content}>
                                <FieldLabel htmlFor="edit-announcement-content">Content</FieldLabel>

                                <Textarea
                                    id="edit-announcement-content"
                                    {...editForm.register("content")}
                                    aria-invalid={!!editForm.formState.errors.content}
                                    placeholder="Write the announcement content..."
                                    rows={6}
                                />

                                {editForm.formState.errors.content && (
                                    <FieldError errors={[editForm.formState.errors.content]} />
                                )}
                            </Field>

                            <Field data-invalid={!!editForm.formState.errors.imageUrl}>
                                <FieldLabel htmlFor="edit-announcement-image-url">
                                    Image URL <span className="font-normal text-zinc-500">(optional)</span>
                                </FieldLabel>

                                <Input
                                    id="edit-announcement-image-url"
                                    {...editForm.register("imageUrl")}
                                    aria-invalid={!!editForm.formState.errors.imageUrl}
                                    placeholder="https://example.com/image.jpg"
                                />

                                {editForm.formState.errors.imageUrl && (
                                    <FieldError errors={[editForm.formState.errors.imageUrl]} />
                                )}
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : "Save changes"}
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
        case "DRAFT":
            return (
                <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                >
                    Draft
                </Badge>
            );

        case "PUBLISHED":
            return (
                <Badge
                    variant="outline"
                    className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                >
                    Published
                </Badge>
            );

        case "ARCHIVED":
            return <Badge variant="secondary">Archived</Badge>;

        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}
