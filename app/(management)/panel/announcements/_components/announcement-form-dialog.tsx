"use client";

import { Megaphone } from "lucide-react";
import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import { FileUpload } from "@/components/file-upload";
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
import { Textarea } from "@/components/ui/textarea";

type FormFields = {
    title?: string;
    content?: string;
    imageUrl?: string;
};

type AnnouncementFormDialogProps<T extends FormFields> = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<T>;
    title: string;
    description: string;
    submitLabel: string;
    pendingLabel: string;
    isPending: boolean;
    onSubmit: (values: T) => void;
};

export function AnnouncementFormDialog<T extends FormFields>({
    open,
    onOpenChange,
    form,
    title,
    description,
    submitLabel,
    pendingLabel,
    isPending,
    onSubmit,
}: AnnouncementFormDialogProps<T>) {
    const { register, watch, setValue, formState } = form as unknown as UseFormReturn<FormFields>;
    const errors = formState.errors;
    const imageUrl = watch("imageUrl");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            form.reset();
        }

        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg">
                <div className="border-l-4 border-l-primary">
                    <DialogHeader className="px-6 pb-2 pt-6">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Megaphone className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <DialogTitle className="text-xl font-semibold tracking-tight">{title}</DialogTitle>

                                <DialogDescription className="mt-1.5 text-sm leading-6">
                                    {description}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 pt-5">
                        <FieldGroup className="gap-5">
                            <Field data-invalid={!!errors.title}>
                                <FieldLabel htmlFor="announcement-title">
                                    Title <span className="text-destructive">*</span>
                                </FieldLabel>

                                <Input
                                    id="announcement-title"
                                    {...register("title")}
                                    aria-invalid={!!errors.title}
                                    placeholder="Enter announcement title"
                                    className="h-11"
                                />

                                {errors.title && <FieldError errors={[errors.title]} />}
                            </Field>

                            <Field data-invalid={!!errors.content}>
                                <FieldLabel htmlFor="announcement-content">
                                    Content <span className="text-destructive">*</span>
                                </FieldLabel>

                                <Textarea
                                    id="announcement-content"
                                    {...register("content")}
                                    aria-invalid={!!errors.content}
                                    placeholder="Write the announcement content..."
                                    rows={5}
                                    className="max-h-48 resize-none overflow-y-auto"
                                />

                                {errors.content && <FieldError errors={[errors.content]} />}
                            </Field>

                            <Field data-invalid={!!errors.imageUrl}>
                                <FieldLabel>
                                    Announcement image{" "}
                                    <span className="font-normal text-muted-foreground">(optional)</span>
                                </FieldLabel>

                                {imageUrl && (
                                    <div className="overflow-hidden rounded-lg border bg-muted/20">
                                        <Image
                                            src={imageUrl as string}
                                            alt="Announcement image preview"
                                            width={800}
                                            height={450}
                                            className="aspect-video w-full object-cover"
                                            unoptimized
                                        />
                                    </div>
                                )}

                                <FileUpload
                                    category="announcement-image"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    currentFile={imageUrl}
                                    onUploadComplete={(url) => {
                                        setValue("imageUrl", url, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        });
                                    }}
                                    label="Upload announcement image"
                                    uploadHint="JPG, PNG, WEBP, or GIF • optimized automatically"
                                    inputId="announcement-image-upload"
                                    variant="detailed"
                                />

                                {errors.imageUrl && <FieldError errors={[errors.imageUrl]} />}
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-6 -mx-6 border-t px-6 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isPending}>
                                {isPending ? pendingLabel : submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
