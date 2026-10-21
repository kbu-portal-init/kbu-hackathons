import { expect, test } from "@playwright/test";

test("announcements API returns valid envelope", async ({ request }) => {
    const response = await request.get("/api/announcements");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.items).toBeInstanceOf(Array);
    expect(body.data.meta).toBeDefined();
    expect(typeof body.data.meta.total).toBe("number");
    expect(typeof body.data.meta.page).toBe("number");
    expect(typeof body.data.meta.pageSize).toBe("number");
    expect(typeof body.data.meta.hasNextPage).toBe("boolean");
});
