import { test, expect } from "@playwright/test";

test("homepage has a h1", async ({ page }) => {
  await page.goto("http://localhost:3000");

  const h1 = await page.waitForSelector("h1");

  expect(await h1.textContent()).toBe("Harmony");
});

test('when maintenance: btn is disabled or enabled', async ({ page }) => {
  await page.goto("http://localhost:3000");

  const isMaintenance = process.env.APP_MAINTENANCE === 'true';
  const btn = await page.waitForSelector('[data-testid="get-started-btn"]');

  if (isMaintenance) {
    expect(await btn.isEnabled()).toBe(false);
  } else {
    expect(await btn.isEnabled()).toBe(true);
  }
});

test('get demo button is visible and clickable', async ({ page }) => {
  await page.goto("http://localhost:3000");

  const isMaintenance = process.env.APP_MAINTENANCE === 'true';

  if (isMaintenance) {
    const demoBtn = await page.$('[data-testid="get-demo-btn"]');
    expect(demoBtn).toBeNull();
  } else {
    const demoBtn = await page.waitForSelector('[data-testid="get-demo-btn"]');
    expect(await demoBtn.isVisible()).toBe(true);
    await demoBtn.click();
  }
});
