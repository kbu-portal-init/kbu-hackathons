"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { removeAnnouncement, updateAnnouncement } from "@/actions/management/announcements";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { AnnouncementListItem } from "@/lib/contracts/announcements";

export function AnnouncementRowActions({ announcement }: { announcement: AnnouncementListItem }) {
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);

    async function transition(nextStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
        setBusy(nextStatus);
        const result = await updateAnnouncement({ id: announcement.id, status: nextStatus });
        setBusy(null);

        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }

        toast.success(`Announcement ${nextStatus.toLowerCase()}.`);
        router.refresh();
    }

    async function onConfirmDelete() {
        setBusy("DELETE");
        const result = await removeAnnouncement({ id: announcement.id });
        setBusy(null);

        if (!result.ok) {
            toast.error(result.error.message);
            return;
        }

        toast.success("Announcement deleted.");
        router.refresh();
    }

    return (
        <div className="flex justify-end gap-2">
            {announcement.status === "DRAFT" ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => transition("PUBLISHED")}
                >
                    {busy === "PUBLISHED" ? "Publishing…" : "Publish"}
                </Button>
            ) : null}
            {announcement.status === "PUBLISHED" ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => transition("ARCHIVED")}
                >
                    {busy === "ARCHIVED" ? "Archiving…" : "Archive"}
                </Button>
            ) : null}
            {announcement.status === "ARCHIVED" ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => transition("PUBLISHED")}
                >
                    {busy === "PUBLISHED" ? "Restoring…" : "Restore"}
                </Button>
            ) : null}

            <AlertDialog>
                <AlertDialogTrigger
                    render={
                        <Button type="button" variant="ghost" size="sm" disabled={busy !== null}>
                            Delete
                        </Button>
                    }
                />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
                        <AlertDialogDescription>
                            “{announcement.title}” will be permanently removed. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDelete} disabled={busy !== null}>
                            {busy === "DELETE" ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
