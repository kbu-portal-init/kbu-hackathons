"use client";

import { AlertCircle, CheckCircle, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpload } from "@/lib/hooks/use-upload";

type FileUploadProps = {
    category:
        | "image"
        | "submission"
        | "event-image"
        | "admin-profile-image"
        | "announcement-image"
        | "member-profile-image";
    accept?: string;
    currentFile?: string | null;
    onUploadComplete: (url: string, key: string) => void;
    onRemove?: () => void;
    label?: string;
    inputId?: string;
};

export function FileUpload({
    category,
    accept,
    currentFile,
    onUploadComplete,
    onRemove,
    label = "Upload file",
    inputId,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { state, progress, error, upload, reset } = useUpload();

    const isUploading = state === "uploading";
    const isAnnouncementImage = category === "announcement-image";

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
        setSelectedFile(file);

        if (inputRef.current) {
            inputRef.current.value = "";
        }

        // Announcement images upload immediately after selection.
        if (isAnnouncementImage) {
            const result = await upload(file, category);

            if (result) {
                onUploadComplete(result.publicUrl, result.key);
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const result = await upload(selectedFile, category);

        if (result) {
            onUploadComplete(result.publicUrl, result.key);
            setSelectedFile(null);
        }
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        reset();

        if (inputRef.current) {
            inputRef.current.value = "";
        }

        onRemove?.();
    };

    const handleCancelSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        reset();

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const hasCurrentFile = Boolean(currentFile);
    const hasSelectedFile = Boolean(selectedFile);

    return (
        <div className="space-y-3">
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
            {(previewUrl || (hasCurrentFile && !hasSelectedFile)) && (
                <div className="overflow-hidden rounded-lg border bg-muted/20">
                    <div className="relative aspect-video w-full">
                        {previewUrl ? (
                            // biome-ignore lint/performance/noImgElement: blob URL is a temporary local preview
                            <img
                                src={previewUrl}
                                alt={selectedFile?.name ?? "Selected file"}
                                className="h-full w-full object-cover"
                            />
                        ) : currentFile ? (
                            <Image
                                src={currentFile}
                                alt="Current announcement"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        ) : null}

                        {isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                                <Loader2 className="mb-2 h-6 w-6 animate-spin" />
                                <p className="text-sm font-medium">Uploading image...</p>
                                <p className="text-muted-foreground text-xs">{progress}%</p>
                            </div>
                        )}
                    </div>

                    {!isUploading && (
                        <div className="flex items-center justify-between gap-2 border-t p-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {selectedFile?.name ??
                                        (hasCurrentFile ? "Current announcement image" : "Selected image")}
                                </p>

                                {selectedFile && (
                                    <p className="text-muted-foreground text-xs">{formatFileSize(selectedFile.size)}</p>
                                )}
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => inputRef.current?.click()}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Replace
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={hasSelectedFile ? handleCancelSelection : handleRemove}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty upload state */}
            {!hasCurrentFile && !hasSelectedFile && !isUploading && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors hover:bg-muted/50"
                >
                    <div className="mb-3 rounded-full bg-muted p-3">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <span className="mb-1 text-sm font-medium">{label}</span>

                    <span className="text-muted-foreground text-xs">JPG, PNG, WEBP, GIF • max 10MB</span>
                </button>
            )}

            {/* Generic upload button for non-announcement uploads */}
            {hasSelectedFile && !isAnnouncementImage && !isUploading && (
                <div className="flex gap-2">
                    <Button type="button" onClick={handleUpload}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>

                    <Button type="button" variant="outline" onClick={handleCancelSelection}>
                        Cancel
                    </Button>
                </div>
            )}

            {/* Upload progress for announcement images */}
            {isUploading && (
                <div className="space-y-2">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <p className="text-muted-foreground text-xs">Uploading... {progress}%</p>
                </div>
            )}

            {/* Success */}
            {state === "done" && !isUploading && (
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
        </div>
    );
}

function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
