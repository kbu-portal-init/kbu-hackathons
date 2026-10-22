import { test as base } from "@playwright/test";

export const test = base.extend({
    page: async ({ page }, use) => {
        await page.route("**/*", (route) => {
            const type = route.request().resourceType();
            if (type === "image" || type === "media") return route.abort();
            return route.continue();
        });
        await use(page);
    },
});

export { expect } from "@playwright/test";
