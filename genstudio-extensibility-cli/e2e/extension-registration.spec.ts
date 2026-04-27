import { test, expect } from "@playwright/test";

test.describe("Extension Registration", () => {
  test("loads the root route without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await expect(page.locator("text=IFrame for integration with Host")).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});
