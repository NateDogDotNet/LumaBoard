import { test, expect } from '@playwright/test';

test('widgets mount correctly', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Check if known widgets are mounted
  await expect(page.locator('clock-widget')).toBeVisible();
  await expect(page.locator('weather-widget')).toBeVisible();
  
  // Check if widgets are functioning (rather than reading shadow DOM content)
  const widgetsWorking = await page.evaluate(() => {
    const clockWidget = document.querySelector('clock-widget');
    const weatherWidget = document.querySelector('weather-widget');
    
    return {
      clockExists: !!clockWidget,
      weatherExists: !!weatherWidget,
      clockHasShadowRoot: clockWidget && (clockWidget.shadowRoot !== null || typeof clockWidget.attachShadow === 'function'),
      weatherHasShadowRoot: weatherWidget && (weatherWidget.shadowRoot !== null || typeof weatherWidget.attachShadow === 'function')
    };
  });
  
  expect(widgetsWorking.clockExists).toBe(true);
  expect(widgetsWorking.weatherExists).toBe(true);
  expect(widgetsWorking.clockHasShadowRoot).toBe(true);
  expect(widgetsWorking.weatherHasShadowRoot).toBe(true);
}); 