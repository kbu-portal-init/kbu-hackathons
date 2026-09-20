import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

export const r2 =
    endpoint && accessKeyId && secretAccessKey
        ? new S3Client({
              region: "auto",
              endpoint,
              credentials: { accessKeyId, secretAccessKey },
          })
        : null;

export const R2_BUCKET = bucketName;
export const R2_PUBLIC_URL = publicUrl?.replace(/\/$/, "");

export function isR2Configured(): boolean {
    return Boolean(r2 && R2_BUCKET && R2_PUBLIC_URL);
}

export function assertR2Configured(): void {
    if (!isR2Configured()) {
        throw new Error(
            "R2 storage configuration is incomplete. Check R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and NEXT_PUBLIC_R2_PUBLIC_URL.",
        );
    }
}
export function isOwnedR2PublicUrl(url: string, keyPrefix: string): boolean {
    if (!R2_PUBLIC_URL) return false;

    try {
        const actual = new URL(url);
        const base = new URL(`${R2_PUBLIC_URL}/`);
        const basePath = base.pathname.replace(/\/$/, "");
        const expectedPrefix = `${basePath}/${keyPrefix.replace(/^\//, "").replace(/\/$/, "")}/`;
        return actual.origin === base.origin && actual.pathname.startsWith(expectedPrefix);
    } catch {
        return false;
    }
}
