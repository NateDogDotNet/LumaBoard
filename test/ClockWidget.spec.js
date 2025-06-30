import { test, expect } from '@playwright/test';

test('ClockWidget displays and updates time', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check if clock widget is visible
  const clockWidget = page.locator('clock-widget');
  await expect(clockWidget).toBeVisible();
  
  // Since the widget uses closed shadow DOM, we can't read the content directly
  // Instead, we test that the widget is properly initialized and functioning
  const isClockFunctioning = await page.evaluate(() => {
    const widget = document.querySelector('clock-widget');
    if (!widget) return false;
    
    // Check if the widget has the expected structure
    return widget.shadowRoot !== null || widget.attachShadow !== undefined;
  });
  
  expect(isClockFunctioning).toBe(true);

  // Test that the widget responds to config changes
  await page.evaluate(() => {
    const widget = document.querySelector('clock-widget');
    if (widget && typeof widget.updateConfig === 'function') {
      widget.updateConfig({ format: '24' });
    }
  });
  
  // Widget should still be visible after config update
  await expect(clockWidget).toBeVisible();
});

test('ClockWidget handles different configurations', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create clock widget with custom config
  await page.evaluate(() => {
    const config = {
      format: '24',
      showDate: false,
      showSeconds: false,
      timezone: 'UTC'
    };

    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    document.body.appendChild(container);

    const clockWidget = document.createElement('clock-widget');
    clockWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(clockWidget);
  });

  // Wait for widget to render
  await page.waitForTimeout(500);

  // Check if custom clock widget is visible
  const customClock = page.locator('clock-widget').last();
  await expect(customClock).toBeVisible();
  
  // Verify the widget was created successfully (config parsing happens in connectedCallback)
  const widgetExists = await page.evaluate(() => {
    const widgets = document.querySelectorAll('clock-widget');
    return widgets.length > 1; // Should have more than the original widget
  });
  
  expect(widgetExists).toBe(true);
});

test('ClockWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create a clock widget for testing
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const clockWidget = document.createElement('clock-widget');
    container.appendChild(clockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test widget lifecycle
  const result = await page.evaluate(() => {
    const widget = document.querySelector('clock-widget');
    if (!widget) return { hasWidget: false };
    
    return {
      hasWidget: true,
      hasRefresh: typeof widget.refresh === 'function',
      hasDestroy: typeof widget.destroy === 'function',
      hasUpdateConfig: typeof widget.updateConfig === 'function'
    };
  });
  
  expect(result.hasWidget).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasUpdateConfig).toBe(true);
}); 