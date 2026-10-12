"use client";

import { AlertCircle, CheckCircle, ImageIcon, LoaderCircle, Pencil, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmActionAlertDialog } from "@/components/confirm-action-alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useUpload } from "@/lib/hooks/use-upload";

type FileUploadProps = {
    category:
        | "image"
        | "submission"
        | "event-image"
        | "admin-profile-image"
        | "organizer-profile-image"
        | "announcement-image"
        | "member-profile-image";
    accept?: string;
    currentFile?: string | null;
    onUploadComplete: (url: string, key: string) => void | Promise<void>;
    onRemove?: () => Promise<void> | void;
    variant?: "icon" | "detailed";
    iconOverlay?: boolean;
    label?: string;
    uploadHint?: string;
    editDescription?: string;
    inputId?: string;
};

type UploadedFile = {
    key: string;
    publicUrl: string;
};

export function FileUpload({
    category,
    accept,
    currentFile,
    onUploadComplete,
    onRemove,
    variant = "icon",
    iconOverlay = false,
    label = "Upload file",
    uploadHint,
    editDescription,
    inputId,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [cleanupError, setCleanupError] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { state, progress, error, upload, reset } = useUpload();

    const isUploading = state === "uploading";
    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        reset();
        setUploadedFile(null);
        setCleanupError(null);
        setSelectedFile(file);
        setDialogOpen(true);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleChoosePhoto = () => {
        setPopoverOpen(false);
        inputRef.current?.click();
    };

    const handleRemove = async () => {
        await onRemove?.();
        setPopoverOpen(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const result = await upload(selectedFile, category);

        if (result) {
            setUploadedFile(result);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadedFile(null);
        setCleanupError(null);
        reset();

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleUseUploadedFile = async () => {
        if (!uploadedFile) return;

        setIsSaving(true);
        try {
            await onUploadComplete(uploadedFile.publicUrl, uploadedFile.key);
            clearSelection();
            setDialogOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelDialog = async () => {
        if (isUploading || isSaving) return;

        if (uploadedFile) {
            setCleanupError(null);

            try {
                const response = await fetch("/api/upload/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: uploadedFile.key }),
                });

                if (!response.ok) {
                    const result = await response.json().catch(() => null);
                    throw new Error(result?.error || "Could not remove the uploaded file.");
                }
            } catch (error) {
                setCleanupError(error instanceof Error ? error.message : "Could not remove the uploaded file.");
                return;
            }
        }

        clearSelection();
        setDialogOpen(false);
    };

    const hasCurrentFile = Boolean(currentFile);
    const hasSelectedFile = Boolean(selectedFile);

    return (
        <div className={iconOverlay ? "absolute right-0 bottom-0" : "space-y-3"}>
            <Input
                ref={inputRef}
                id={inputId ?? `file-upload-${category}`}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
            />

            {/* Image preview */}
            {/* Empty upload state */}
            {!hasSelectedFile && !isUploading && !iconOverlay && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    aria-label={hasCurrentFile ? "Replace image" : label}
                    className={
                        variant === "detailed"
                            ? "flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 text-left transition-colors hover:border-primary hover:bg-muted/50"
                            : "flex size-10 cursor-pointer items-center justify-center rounded-full border border-dashed transition-colors hover:border-primary hover:bg-muted/50"
                    }
                >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <ImageIcon className="size-5 text-muted-foreground" />
                    </div>

                    {variant === "detailed" && (
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                                {hasCurrentFile ? "Replace image" : label}
                            </span>
                            {uploadHint && (
                                <span className="block truncate text-xs text-muted-foreground">{uploadHint}</span>
                            )}
                        </span>
                    )}
                </button>
            )}

            {!hasSelectedFile && !isUploading && iconOverlay && (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger
                        render={
                            <Button
                                type="button"
                                size="icon"
                                className="cursor-pointer rounded-full"
                                aria-label={`Edit ${label.toLowerCase()}`}
                            />
                        }
                    >
                        <Pencil data-icon="inline-start" />
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                        <PopoverHeader>
                            <PopoverTitle>Edit image</PopoverTitle>
                            {editDescription && <PopoverDescription>{editDescription}</PopoverDescription>}
                        </PopoverHeader>
                        <div className="flex flex-col gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="justify-start"
                                onClick={handleChoosePhoto}
                            >
                                <Upload data-icon="inline-start" />
                                Upload a photo
                            </Button>
                            {hasCurrentFile && onRemove && (
                                <ConfirmActionAlertDialog
                                    trigger={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="justify-start text-destructive"
                                        >
                                            <Trash2 data-icon="inline-start" />
                                            Remove photo
                                        </Button>
                                    }
                                    title="Remove photo?"
                                    description="This will remove the photo from this profile or team logo."
                                    confirmLabel="Remove photo"
                                    onConfirm={handleRemove}
                                />
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* Success */}
            {state === "done" && !isUploading && !dialogOpen && (
                <p className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Image uploaded successfully
                </p>
            )}

            {/* Error */}
            {error && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) void handleCancelDialog();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Use this photo?</DialogTitle>
                    </DialogHeader>

                    {previewUrl && (
                        // biome-ignore lint/performance/noImgElement: blob URL is a temporary local preview
                        <img
                            src={uploadedFile?.publicUrl ?? previewUrl}
                            alt={selectedFile?.name ?? "Selected image"}
                            className="max-h-[50vh] w-full rounded-lg object-contain"
                        />
                    )}

                    {isUploading && (
                        <div className="flex flex-col gap-2">
                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="sr-only" aria-live="polite">
                                {progress}%
                            </span>
                        </div>
                    )}

                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {cleanupError && <p className="text-sm text-destructive">{cleanupError}</p>}

                    <DialogFooter>
                        {uploadedFile ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => void handleCancelDialog()}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" onClick={() => void handleUseUploadedFile()} disabled={isSaving}>
                                    {isSaving && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                                    {isSaving ? "Saving…" : "Use this photo"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => void handleCancelDialog()}
                                    disabled={isUploading || isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleUpload} disabled={isUploading || !selectedFile}>
                                    {isUploading && <LoaderCircle className="animate-spin" data-icon="inline-start" />}
                                    {isUploading ? "Uploading…" : "Use this photo"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
