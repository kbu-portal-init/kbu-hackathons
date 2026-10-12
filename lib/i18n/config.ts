export const LOCALE_COOKIE = "kbu-locale";
export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string | undefined): value is Locale {
    return value === "en" || value === "th";
}
