import { test, expect } from "@playwright/test";

test.describe("Template Viewer (importTemplateExtension)", () => {
  test("renders at /select-template-dialog route", async ({ page }) => {
    await page.goto("/#/select-template-dialog");
    const viewer = page.getByTestId("template-viewer");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("heading", { name: "Template Viewer" })).toBeVisible();
  });

  test("shows connecting state before host is available", async ({ page }) => {
    await page.goto("/#/select-template-dialog");
    await expect(page.getByTestId("template-viewer")).toBeVisible();
    await expect(page.getByText("Connecting to host...")).toBeVisible();
  });
});
