import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('h1')).toHaveText('Welcome to LumaBoard');
}); 