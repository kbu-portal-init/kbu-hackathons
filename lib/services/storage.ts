import "server-only";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { ActionResult } from "@/lib/contracts/common";
import { ErrorCodes } from "@/lib/contracts/errors";
import type { DeleteObjectInput } from "@/lib/contracts/storage";
import { isOwnedR2PublicUrl, isR2Configured, R2_BUCKET, R2_PUBLIC_URL, r2 } from "@/lib/r2";

function assertKeyOwnership(key: string, owner: string): boolean {
    return key.startsWith(`uploads/${owner}/`);
}

export async function deleteObject(input: DeleteObjectInput, teamId: string): Promise<ActionResult<{ ok: true }>> {
    if (!assertKeyOwnership(input.key, teamId)) {
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "Access denied" } };
    }
    if (!isR2Configured() || !r2 || !R2_BUCKET) {
        return {
            ok: false,
            error: {
                code: ErrorCodes.STORAGE_NOT_CONFIGURED,
                message: "Storage is not configured",
            },
        };
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
            error: {
                code: ErrorCodes.DELETE_FAILED,
                message: "Failed to delete file",
            },
        };
    }
}

export async function deleteOwnedR2PublicUrl(url: string, keyPrefix: string): Promise<ActionResult<{ ok: true }>> {
    if (!isOwnedR2PublicUrl(url, `uploads/${keyPrefix}`) || !R2_PUBLIC_URL) {
        return { ok: false, error: { code: ErrorCodes.FORBIDDEN, message: "Access denied" } };
    }

    const publicUrl = new URL(url);
    const baseUrl = new URL(`${R2_PUBLIC_URL}/`);
    const key = decodeURIComponent(publicUrl.pathname.slice(baseUrl.pathname.length).replace(/^\//, ""));
    return deleteObject({ key }, keyPrefix);
}
