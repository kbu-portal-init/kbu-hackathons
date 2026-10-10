import "server-only";

import { getEventSettings } from "@/lib/data/event-settings";

const STATIC_OG_IMAGE = "/images/kbu.webp";

/**
 * Resolve the social-preview image chain: preferred (announcement) image,
 * then the first organizer event image, then the static fallback.
 */
export async function resolveOgImageUrl(preferred: string | null = null): Promise<string> {
    if (preferred) return preferred;

    try {
        const event = await getEventSettings();
        return event?.imageUrls[0] ?? STATIC_OG_IMAGE;
    } catch {
        return STATIC_OG_IMAGE;
    }
}
