import { test, expect } from "@playwright/test";

test.describe("Validation Panel", () => {
  test("renders at /validation-panel route", async ({ page }) => {
    await page.goto("/#/validation-panel");
    const panel = page.getByTestId("validation-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Validation Panel" })).toBeVisible();
  });

  test("shows connecting state before host is available", async ({ page }) => {
    await page.goto("/#/validation-panel");
    await expect(page.getByTestId("validation-panel")).toBeVisible();
    await expect(page.getByText("Connecting to host...")).toBeVisible();
  });
});
