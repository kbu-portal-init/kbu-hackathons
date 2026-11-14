"use client";

import { useCallback, useState } from "react";

type UploadState = "idle" | "uploading" | "done" | "error";

type UploadResult = {
    key: string;
    publicUrl: string;
};

type UploadContext = {
    teamId: string;
    memberId: string;
};

export function useUpload() {
    const [state, setState] = useState<UploadState>("idle");
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(
        async (
            file: File,
            category:
                | "image"
                | "submission"
                | "event-image"
                | "admin-profile-image"
                | "organizer-profile-image"
                | "announcement-image"
                | "member-profile-image"
                | "management-member-profile-image",
            context?: UploadContext,
        ): Promise<UploadResult | null> => {
            setState("uploading");
            setError(null);

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("category", category);

                if (category === "management-member-profile-image") {
                    if (!context) {
                        throw new Error("Team and member context is required for management uploads.");
                    }

                    formData.append("teamId", context.teamId);
                    formData.append("memberId", context.memberId);
                }

                const res = await fetch("/api/upload/proxy", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Upload failed");
                }

                const { key, publicUrl } = await res.json();
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
        setError(null);
    }, []);

    return { state, progress: 0, error, upload, reset };
}
