import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    AnnouncementStatusSchema,
    CreateAnnouncementInputSchema,
    ListAnnouncementSchema,
} from "@/lib/contracts/announcements";
import { toFieldErrors } from "@/lib/validation/zod";

describe("announcement validation", () => {
    it("accepts valid announcement input", () => {
        const result = CreateAnnouncementInputSchema.safeParse({
            title: "  Test Announcement  ",
            content: "  Announcement content  ",
            imageUrl: "",
        });

        assert.equal(result.success, true);

        if (!result.success) return;

        assert.equal(result.data.title, "Test Announcement");
        assert.equal(result.data.content, "Announcement content");
    });

    it("rejects an empty title", () => {
        const result = CreateAnnouncementInputSchema.safeParse({
            title: "   ",
            content: "Valid content",
            imageUrl: "",
        });

        assert.equal(result.success, false);

        if (result.success) return;

        const fieldErrors = toFieldErrors(result.error);

        assert.ok(fieldErrors.title);
        assert.ok(fieldErrors.title.length > 0);
    });

    it("rejects an empty content", () => {
        const result = CreateAnnouncementInputSchema.safeParse({
            title: "Valid title",
            content: "   ",
            imageUrl: "",
        });

        assert.equal(result.success, false);

        if (result.success) return;

        const fieldErrors = toFieldErrors(result.error);

        assert.ok(fieldErrors.content);
        assert.ok(fieldErrors.content.length > 0);
    });

    it("rejects a title longer than 200 characters", () => {
        const result = CreateAnnouncementInputSchema.safeParse({
            title: "a".repeat(201),
            content: "Valid content",
            imageUrl: "",
        });

        assert.equal(result.success, false);
    });

    it("rejects content longer than 10,000 characters", () => {
        const result = CreateAnnouncementInputSchema.safeParse({
            title: "Valid title",
            content: "a".repeat(10_001),
            imageUrl: "",
        });

        assert.equal(result.success, false);
    });

    it("accepts valid announcement statuses", () => {
        assert.equal(AnnouncementStatusSchema.safeParse("DRAFT").success, true);
        assert.equal(AnnouncementStatusSchema.safeParse("PUBLISHED").success, true);
        assert.equal(AnnouncementStatusSchema.safeParse("ARCHIVED").success, true);
    });

    it("rejects an invalid announcement status", () => {
        const result = AnnouncementStatusSchema.safeParse("DELETED");

        assert.equal(result.success, false);
    });

    it("applies safe pagination defaults", () => {
        const result = ListAnnouncementSchema.safeParse({});

        assert.equal(result.success, true);

        if (!result.success) return;

        assert.equal(result.data.page, 1);
        assert.equal(result.data.pageSize, 20);
    });

    it("rejects invalid pagination values", () => {
        const invalidPage = ListAnnouncementSchema.safeParse({
            page: 0,
        });

        const invalidPageSize = ListAnnouncementSchema.safeParse({
            pageSize: 101,
        });

        assert.equal(invalidPage.success, false);
        assert.equal(invalidPageSize.success, false);
    });

    it("accepts valid status filters", () => {
        const result = ListAnnouncementSchema.safeParse({
            status: "PUBLISHED",
        });

        assert.equal(result.success, true);

        if (!result.success) return;

        assert.equal(result.data.status, "PUBLISHED");
    });

    it("rejects invalid status filters", () => {
        const result = ListAnnouncementSchema.safeParse({
            status: "INVALID",
        });

        assert.equal(result.success, false);

        if (result.success) return;

        const fieldErrors = toFieldErrors(result.error);

        assert.ok(fieldErrors.status);
    });
});
