import "server-only";

/**
 * Social preview fallback. Must stay a raster format Facebook's crawler accepts
 * (jpeg/png/gif) — WebP is not supported for `og:image`.
 */
export const STATIC_OG_IMAGE = "/images/og.jpg";

const SOCIAL_SAFE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

function isSocialSafeImage(url: string): boolean {
    const path = url.split(/[?#]/)[0].toLowerCase();
    return SOCIAL_SAFE_EXTENSIONS.some((extension) => path.endsWith(extension));
}

/**
 * Resolve the social-preview image. A preferred image is only used when it is a
 * format `og:image` consumers accept; otherwise (e.g. an uploaded WebP) the
 * static JPEG fallback is returned.
 */
export function resolveOgImageUrl(preferred: string | null = null): string {
    return preferred && isSocialSafeImage(preferred) ? preferred : STATIC_OG_IMAGE;
}
