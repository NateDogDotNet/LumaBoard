import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check if the scene container exists
  await expect(page.locator('.scene-layout')).toBeVisible();
  
  // Check if widgets are rendered
  await expect(page.locator('clock-widget')).toBeVisible();
}); 