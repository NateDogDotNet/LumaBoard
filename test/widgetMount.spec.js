import { test, expect } from '@playwright/test';

test('widgets mount correctly', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Check if known widgets are mounted
  await expect(page.locator('clock-widget')).toBeVisible();
  await expect(page.locator('weather-widget')).toBeVisible();
  
  // Check if clock widget shows time
  const clockWidget = page.locator('clock-widget');
  await expect(clockWidget).toContainText(':');
}); 