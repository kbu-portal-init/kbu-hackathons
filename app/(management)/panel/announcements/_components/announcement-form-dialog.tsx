import { Megaphone } from "lucide-react";
import Image from "next/image";
import type { FieldValues, UseFormReturn } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AnnouncementCategory = "IMPORTANT" | "UPDATES" | "NEWS";

type FormFields = {
    title?: string;
    content?: string;
    imageUrl?: string;
    category?: AnnouncementCategory;
};

type AnnouncementFormDialogProps<TInput extends FormFields, TOutput extends FieldValues = TInput> = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<TInput, unknown, TOutput>;
    title: string;
    description: string;
    submitLabel: string;
    pendingLabel: string;
    isPending: boolean;
    onSubmit: (values: TOutput) => void;
};

export function AnnouncementFormDialog<TInput extends FormFields, TOutput extends FieldValues = TInput>({
    open,
    onOpenChange,
    form,
    title,
    description,
    submitLabel,
    pendingLabel,
    isPending,
    onSubmit,
}: AnnouncementFormDialogProps<TInput, TOutput>) {
    // Keep the existing UI generic while allowing Zod input/output types to differ.
    const typedForm = form as unknown as UseFormReturn<FormFields>;
    const { register, watch, setValue, formState } = typedForm;
    const errors = formState.errors;
    const imageUrl = watch("imageUrl");
    const category = watch("category");

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            form.reset();
        }

        onOpenChange(nextOpen);
    };

    const handleCategoryChange = (value: FormFields["category"] | null) => {
        if (value === null) {
            return;
        }

        setValue("category", value, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-2 border-border p-0 sm:max-w-lg">
                <div className="border-t-4 border-t-primary">
                    <DialogHeader className="px-6 pb-2 pt-6">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center bg-accent text-accent-foreground">
                                <Megaphone className="size-5" />
                            </div>

                            <div className="min-w-0">
                                <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
                                    {title}
                                </DialogTitle>

                                <DialogDescription className="mt-1.5 text-sm leading-6">
                                    {description}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 pt-5">
                        <FieldGroup className="gap-5">
                            <Field data-invalid={!!errors.title}>
                                <FieldLabel
                                    className="font-display text-sm font-semibold text-foreground"
                                    htmlFor="announcement-title"
                                >
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
                                <FieldLabel
                                    className="font-display text-sm font-semibold text-foreground"
                                    htmlFor="announcement-content"
                                >
                                    Content <span className="text-destructive">*</span>
                                </FieldLabel>

                                <Textarea
                                    id="announcement-content"
                                    {...register("content")}
                                    aria-invalid={!!errors.content}
                                    placeholder="Write the announcement content..."
                                    rows={5}
                                    className="max-h-48 resize-none overflow-y-auto border-2 border-border/25 bg-card"
                                />

                                {errors.content && <FieldError errors={[errors.content]} />}
                            </Field>

                            <Field data-invalid={!!errors.category}>
                                <FieldLabel
                                    className="font-display text-sm font-semibold text-foreground"
                                    htmlFor="announcement-category"
                                >
                                    Category <span className="text-destructive">*</span>
                                </FieldLabel>

                                <Select value={category ?? "NEWS"} onValueChange={handleCategoryChange}>
                                    <SelectTrigger
                                        id="announcement-category"
                                        className="h-11 border-2 border-border/25 bg-card"
                                        aria-invalid={!!errors.category}
                                    >
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="IMPORTANT">Important</SelectItem>
                                        <SelectItem value="UPDATES">Updates</SelectItem>
                                        <SelectItem value="NEWS">News</SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.category && <FieldError errors={[errors.category]} />}
                            </Field>

                            <Field data-invalid={!!errors.imageUrl}>
                                <FieldLabel className="font-display text-sm font-semibold text-foreground">
                                    Announcement image{" "}
                                    <span className="font-normal text-muted-foreground">(optional)</span>
                                </FieldLabel>

                                {imageUrl && (
                                    <div className="overflow-hidden border-2 border-border bg-muted/20">
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

                        <DialogFooter className="mt-6 -mx-6 border-t-2 border-border/15 px-6 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>

                            <Button variant="default" type="submit" disabled={isPending}>
                                {isPending ? pendingLabel : submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
