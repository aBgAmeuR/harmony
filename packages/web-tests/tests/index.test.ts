import { test, expect } from "@playwright/test";

test("homepage has a h1", async ({ page }) => {
  await page.goto("http://localhost:3000");

  const h1 = await page.waitForSelector("h1");

  expect(await h1.textContent()).toBe("Harmony");
});