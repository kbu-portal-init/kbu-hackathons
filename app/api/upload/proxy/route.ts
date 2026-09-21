import { PutObjectCommand } from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireApprovedTeam, requireOrganizerOrAdmin } from "@/lib/auth/guards";
import { ALLOWED_IMAGE_TYPES, ALLOWED_SUBMISSION_TYPES, MAX_FILE_SIZE, MAX_IMAGE_SIZE } from "@/lib/contracts/storage";
import { isR2Configured, R2_BUCKET, R2_PUBLIC_URL, r2 } from "@/lib/r2";
import { toFieldErrors } from "@/lib/validation/zod";

const proxySchema = z.object({
    category: z.enum([
        "image",
        "submission",
        "event-image",
        "admin-profile-image",
        "announcement-image",
        "member-profile-image",
    ]),
});

const IMAGE_CATEGORIES = [
    "image",
    "event-image",
    "admin-profile-image",
    "announcement-image",
    "member-profile-image",
] as const;

async function getUploadOwner(category: string) {
    try {
        if (category === "admin-profile-image") {
            return (await requireAdmin()).user.id;
        }

        if (category === "event-image") {
            await requireOrganizerOrAdmin();
            return "events";
        }

        if (category === "announcement-image") {
            await requireOrganizerOrAdmin();
            return "announcements";
        }

        if (category === "member-profile-image") {
            const { team } = await requireApprovedTeam();
            return team.id;
        }

        return (await requireApprovedTeam()).team.id;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const categoryRaw = formData.get("category") as string | null;

        if (!file || !categoryRaw) {
            return NextResponse.json({ error: "Missing file or category" }, { status: 400 });
        }

        const parsed = proxySchema.safeParse({
            category: categoryRaw,
        });

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    fieldErrors: toFieldErrors(parsed.error),
                },
                { status: 400 },
            );
        }

        const { category } = parsed.data;

        const allowedTypes = IMAGE_CATEGORIES.includes(category as (typeof IMAGE_CATEGORIES)[number])
            ? ALLOWED_IMAGE_TYPES
            : ALLOWED_SUBMISSION_TYPES;

        if (!(allowedTypes as readonly string[]).includes(file.type)) {
            return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
        }

        const maxSize = IMAGE_CATEGORIES.includes(category as (typeof IMAGE_CATEGORIES)[number])
            ? MAX_IMAGE_SIZE
            : MAX_FILE_SIZE;

        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large" }, { status: 400 });
        }

        const owner = await getUploadOwner(category);

        if (!owner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!isR2Configured() || !r2 || !R2_BUCKET || !R2_PUBLIC_URL) {
            return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
        }

        const ext = file.name.split(".").pop() ?? "bin";

        const key =
            category === "admin-profile-image"
                ? `uploads/admins/${owner}/${crypto.randomUUID()}.${ext}`
                : `uploads/${owner}/${crypto.randomUUID()}.${ext}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        await r2.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                ContentLength: buffer.length,
            }),
        );

        return NextResponse.json({
            key,
            publicUrl: `${R2_PUBLIC_URL}/${key}`,
        });
    } catch (err) {
        console.error("Upload proxy error:", err);

        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
