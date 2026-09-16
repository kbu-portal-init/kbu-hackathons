import "server-only";

import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { ActionResult } from "@/lib/contracts/common";
import type { DeleteObjectInput, FinalizeInput, PresignedUrlInput, PresignedUrlResult } from "@/lib/contracts/storage";
import { R2_BUCKET, r2 } from "@/lib/r2";

function assertKeyOwnership(key: string, teamId: string): boolean {
    return key.startsWith(`uploads/${teamId}/`);
}

export async function generatePresignedUploadUrl(
    input: PresignedUrlInput,
    teamId: string,
): Promise<ActionResult<PresignedUrlResult>> {
    try {
        const ext = input.fileName.split(".").pop() ?? "bin";
        const key = `uploads/${teamId}/${crypto.randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            ContentType: input.fileType,
        });

        const presignedUrl = await getSignedUrl(r2, command, {
            expiresIn: 300,
        });

        return {
            ok: true,
            data: {
                presignedUrl,
                key,
                publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`,
            },
        };
    } catch {
        return {
            ok: false,
            error: {
                code: "PRESIGN_FAILED",
                message: "Failed to generate upload URL",
            },
        };
    }
}

export async function verifyUpload(input: FinalizeInput, teamId: string): Promise<ActionResult<{ publicUrl: string }>> {
    if (!assertKeyOwnership(input.key, teamId)) {
        return { ok: false, error: { code: "FORBIDDEN", message: "Access denied" } };
    }
    try {
        const head = await r2.send(
            new HeadObjectCommand({
                Bucket: R2_BUCKET,
                Key: input.key,
            }),
        );

        if (!head.ContentLength || head.ContentLength === 0) {
            return {
                ok: false,
                error: { code: "EMPTY_OBJECT", message: "Uploaded file is empty" },
            };
        }

        return {
            ok: true,
            data: {
                publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${input.key}`,
            },
        };
    } catch {
        return {
            ok: false,
            error: { code: "OBJECT_NOT_FOUND", message: "File not found in storage" },
        };
    }
}

export async function deleteObject(input: DeleteObjectInput, teamId: string): Promise<ActionResult<{ ok: true }>> {
    if (!assertKeyOwnership(input.key, teamId)) {
        return { ok: false, error: { code: "FORBIDDEN", message: "Access denied" } };
    }
    try {
        await r2.send(
            new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: input.key,
            }),
        );
        return { ok: true, data: { ok: true } };
    } catch {
        return {
            ok: false,
            error: { code: "DELETE_FAILED", message: "Failed to delete file" },
        };
    }
}
