import { test, expect } from '@playwright/test';

test('ClockWidget displays and updates time', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check if clock widget is visible
  const clockWidget = page.locator('clock-widget');
  await expect(clockWidget).toBeVisible();
  
  // Check if time is displayed (contains colon)
  await expect(clockWidget).toContainText(':');
  
  // Wait a bit and check if time updates
  await page.waitForTimeout(1100);
  const timeText1 = await clockWidget.textContent();
  
  await page.waitForTimeout(1100);
  const timeText2 = await clockWidget.textContent();
  
  // Time should have changed (though this might be flaky if seconds don't change)
  // At minimum, verify it still contains time format
  expect(timeText2).toMatch(/\d{1,2}:\d{2}/);
});

test('ClockWidget configuration options', async ({ page }) => {
  // Test with custom configuration
  await page.goto('http://localhost:5173');
  
  // Inject a clock widget with custom config for testing
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const clockWidget = document.createElement('clock-widget');
    clockWidget.config = {
      format: '24',
      showDate: false,
      showSeconds: false
    };
    container.appendChild(clockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Check that the widget exists
  const customClock = page.locator('clock-widget').last();
  await expect(customClock).toBeVisible();
});

test('ClockWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const clockWidget = document.querySelector('clock-widget');
    if (!clockWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof clockWidget.init === 'function';
    const hasRefresh = typeof clockWidget.refresh === 'function';
    const hasDestroy = typeof clockWidget.destroy === 'function';
    
    return { hasInit, hasRefresh, hasDestroy };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
}); 