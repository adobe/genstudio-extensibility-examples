import { test, expect } from "@playwright/test";

test.describe("Asset Viewer (selectContentExtension)", () => {
  test("renders at /select-content-dialog route", async ({ page }) => {
    await page.goto("/#/select-content-dialog");
    const viewer = page.getByTestId("asset-viewer");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("heading", { name: "Asset Viewer" })).toBeVisible();
  });

  test("shows connecting state before host is available", async ({ page }) => {
    await page.goto("/#/select-content-dialog");
    await expect(page.getByTestId("asset-viewer")).toBeVisible();
    await expect(page.getByText("Connecting to host...")).toBeVisible();
  });
});
