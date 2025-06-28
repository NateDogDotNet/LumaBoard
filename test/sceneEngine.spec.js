import { test, expect } from '@playwright/test';

test('scene engine basic functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Check if the scene container exists
  await expect(page.locator('.scene-container')).toBeVisible();
  
  // Check if widgets are rendered
  await expect(page.locator('clock-widget')).toBeVisible();
  await expect(page.locator('weather-widget')).toBeVisible();
}); 