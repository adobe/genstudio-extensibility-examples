import { test, expect } from "@playwright/test";

test.describe("Prompt Dialog", () => {
  test("renders at /prompt-dialog route", async ({ page }) => {
    await page.goto("/#/prompt-dialog");
    const dialog = page.getByTestId("prompt-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Prompt Dialog" })).toBeVisible();
  });

  test("shows connecting state before host is available", async ({ page }) => {
    await page.goto("/#/prompt-dialog");
    await expect(page.getByTestId("prompt-dialog")).toBeVisible();
    await expect(page.getByText("Connecting to host...")).toBeVisible();
  });
});
