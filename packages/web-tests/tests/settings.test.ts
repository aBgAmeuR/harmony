// import { test, expect } from "@playwright/test";

// test.beforeEach(async ({ page }) => {
//   await page.goto("http://localhost:3000/");

//   const isMaintenance = process.env.APP_MAINTENANCE === 'true';
//   if (isMaintenance) test.skip(isMaintenance, 'Maintenance mode is enabled');

//   const demoBtn = await page.waitForSelector('[data-testid="get-demo-btn"]');
//   await demoBtn.click();
// });

// test("settings page has app information", async ({ page }) => {
//   await page.goto("http://localhost:3000/");

//   const isMaintenance = process.env.APP_MAINTENANCE === 'true';
//   if (isMaintenance) test.skip(isMaintenance, 'Maintenance mode is enabled');

//   const demoBtn = await page.waitForSelector('[data-testid="get-demo-btn"]');
//   await demoBtn.click();

//   await page.goto("http://localhost:3000/settings/about");
  
//   await page.waitForLoadState('networkidle');
//   const appInfo = await page.waitForSelector('h2:has-text("App Information")', { timeout: 60000 });

//   expect(appInfo).not.toBeNull();
// });