import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

let STATIC_OG_IMAGE: string;
let resolveOgImageUrl: typeof import("@/lib/data/og-image").resolveOgImageUrl;

before(async () => {
    const serverOnlyPath = require.resolve("server-only");
    require.cache[serverOnlyPath] = { exports: {} } as NodeJS.Module;
    ({ STATIC_OG_IMAGE, resolveOgImageUrl } = await import("@/lib/data/og-image"));
});

describe("og image resolution", () => {
    it("falls back to the static JPEG without a preferred image", () => {
        assert.equal(resolveOgImageUrl(), STATIC_OG_IMAGE);
        assert.equal(resolveOgImageUrl(null), STATIC_OG_IMAGE);
    });

    it("uses a social-safe preferred image and rejects WebP", () => {
        assert.equal(resolveOgImageUrl("https://cdn.test/a.jpg?x=1"), "https://cdn.test/a.jpg?x=1");
        assert.equal(resolveOgImageUrl("https://cdn.test/a.PNG"), "https://cdn.test/a.PNG");
        assert.equal(resolveOgImageUrl("https://cdn.test/a.webp"), STATIC_OG_IMAGE);
    });
});
