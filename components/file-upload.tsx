"use client";

import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpload } from "@/lib/hooks/use-upload";

type FileUploadProps = {
    category: "image" | "submission" | "event-image";
    accept?: string;
    currentFile?: string | null;
    onUploadComplete: (url: string, key: string) => void;
    onRemove?: () => void;
    label?: string;
};

export function FileUpload({
    category,
    accept,
    currentFile,
    onUploadComplete,
    onRemove,
    label = "Upload file",
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { state, progress, error, upload, reset } = useUpload();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        const result = await upload(selectedFile, category);
        if (result) {
            onUploadComplete(result.publicUrl, result.key);
            setSelectedFile(null);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRemove = () => {
        setSelectedFile(null);
        reset();
        if (inputRef.current) inputRef.current.value = "";
        onRemove?.();
    };

    const isUploading = state === "uploading" || state === "finalizing";

    return (
        <div className="space-y-3">
            <Input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                id={`file-upload-${category}`}
            />

            {currentFile && !selectedFile && (
                <div className="flex items-center gap-2 rounded-md border p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="flex-1 truncate text-sm">Current file uploaded</span>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={isUploading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {selectedFile && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md border p-2">
                        <span className="flex-1 truncate text-sm">{selectedFile.name}</span>
                        <span className="text-muted-foreground text-xs">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        {!isUploading && (
                            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {isUploading && (
                        <div className="space-y-1">
                            <div className="bg-secondary h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-muted-foreground text-xs">
                                {state === "uploading" ? `Uploading... ${progress}%` : "Verifying..."}
                            </p>
                        </div>
                    )}

                    {state === "done" && (
                        <p className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" /> Upload complete
                        </p>
                    )}

                    {error && (
                        <p className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" /> {error}
                        </p>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    {currentFile && !selectedFile ? "Replace" : label}
                </Button>

                {selectedFile && !isUploading && state !== "done" && (
                    <Button type="button" size="sm" onClick={handleUpload}>
                        Upload
                    </Button>
                )}
            </div>
        </div>
    );
}
