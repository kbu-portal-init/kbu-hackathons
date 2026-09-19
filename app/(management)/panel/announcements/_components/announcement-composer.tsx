"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveAnnouncement } from "@/actions/management/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    type CreateAnnouncementFormInput,
    type CreateAnnouncementInput,
    createAnnouncementSchema,
} from "@/lib/contracts/announcements";
import { applyActionFieldErrors } from "@/lib/validation/react-hook-form";

export function AnnouncementComposer() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        formState: { errors },
    } = useForm<CreateAnnouncementFormInput, unknown, CreateAnnouncementInput>({
        resolver: zodResolver(createAnnouncementSchema),
        defaultValues: { status: "DRAFT", pinned: false },
    });

    async function onSubmit(values: CreateAnnouncementInput) {
        setIsSubmitting(true);
        const result = await saveAnnouncement(values);
        setIsSubmitting(false);

        if (!result.ok) {
            applyActionFieldErrors(result.error.fieldErrors, setError);
            toast.error(result.error.message);
            return;
        }

        toast.success(values.status === "PUBLISHED" ? "Announcement published." : "Draft saved.");
        reset({ status: "DRAFT", pinned: false, title: "", body: "" });
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Announcement title"
                    required
                    disabled={isSubmitting}
                    {...register("title")}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                    id="body"
                    rows={6}
                    placeholder="Share an update with participants…"
                    required
                    disabled={isSubmitting}
                    {...register("body")}
                />
                {errors.body && <p className="text-sm text-red-600">{errors.body.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300"
                    disabled={isSubmitting}
                    {...register("pinned")}
                />
                Pin to top
            </label>
            <div className="flex gap-2">
                <Button
                    type="submit"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => setValue("status", "DRAFT")}
                >
                    Save draft
                </Button>
                <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => setValue("status", "PUBLISHED")}
                >
                    Publish
                </Button>
            </div>
        </form>
    );
}
