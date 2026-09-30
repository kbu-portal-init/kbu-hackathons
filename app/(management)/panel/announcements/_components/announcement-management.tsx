"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { PaginationFooter } from "@/components/pagination-footer";
import { Button } from "@/components/ui/button";
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
import { AnnouncementFormDialog } from "./announcement-form-dialog";
import { AnnouncementTable } from "./announcement-table";

type Props = {
    items: AnnouncementDTO[];
    meta: PaginationMeta;
};

const statusFilters = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const;

type StatusFilter = (typeof statusFilters)[number];

export function AnnouncementManagement({ items, meta }: Props) {
    const router = useRouter();

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
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

    const buildPageHref = (page: number) => {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(meta.pageSize),
        });

        if (statusFilter !== "ALL") {
            params.set("status", statusFilter);
        }

        return `/panel/announcements?${params.toString()}`;
    };

    return (
        <>
            {/* Filters + Create */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
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

            <AnnouncementTable
                items={items}
                isPending={isPending}
                onEdit={handleEdit}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onDelete={handleDelete}
            />

            <PaginationFooter
                page={meta.page}
                pageSize={meta.pageSize}
                total={meta.total}
                itemsShown={items.length}
                hasNextPage={meta.hasNextPage}
                getPageHref={buildPageHref}
            />

            <AnnouncementFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                form={createForm}
                title="Create announcement"
                description="Share important news, updates, and events with the KBU community."
                submitLabel="Create announcement"
                pendingLabel="Creating..."
                isPending={isPending}
                onSubmit={handleCreate}
            />

            <AnnouncementFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                form={editForm}
                title="Edit announcement"
                description="Update the announcement details and image."
                submitLabel="Save changes"
                pendingLabel="Saving..."
                isPending={isPending}
                onSubmit={handleUpdate}
            />
        </>
    );
}
