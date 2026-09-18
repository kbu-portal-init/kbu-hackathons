"use client";

import { useCallback, useState } from "react";

type UploadState = "idle" | "uploading" | "finalizing" | "done" | "error";

type UploadResult = {
    key: string;
    publicUrl: string;
};

export function useUpload() {
    const [state, setState] = useState<UploadState>("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(
        async (file: File, category: "image" | "submission" | "event-image"): Promise<UploadResult | null> => {
            setState("uploading");
            setProgress(0);
            setError(null);

            try {
                const presignedRes = await fetch("/api/upload/presigned-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                        category,
                    }),
                });

                if (!presignedRes.ok) {
                    const err = await presignedRes.json();
                    throw new Error(err.error || "Failed to get upload URL");
                }

                const { presignedUrl, key, publicUrl } = await presignedRes.json();

                setState("uploading");
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            setProgress(Math.round((e.loaded / e.total) * 100));
                        }
                    };
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error("Upload to storage failed"));
                        }
                    };
                    xhr.onerror = () => reject(new Error("Network error during upload"));
                    xhr.open("PUT", presignedUrl);
                    xhr.setRequestHeader("Content-Type", file.type);
                    xhr.send(file);
                });

                setState("finalizing");
                const finalizeRes = await fetch("/api/upload/finalize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key }),
                });

                if (!finalizeRes.ok) {
                    const err = await finalizeRes.json();
                    throw new Error(err.error || "Failed to verify upload");
                }

                setState("done");
                return { key, publicUrl };
            } catch (err) {
                setState("error");
                const message = err instanceof Error ? err.message : "Upload failed";
                setError(message);
                return null;
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setState("idle");
        setProgress(0);
        setError(null);
    }, []);

    return { state, progress, error, upload, reset };
}
