import { test, expect } from '@playwright/test';

test('CountdownWidget displays and counts down', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a countdown widget to test
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date to 1 hour from now
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 1);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Test Countdown',
      format: 'digital'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if countdown widget is visible
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  
  // Should show the header
  await expect(countdownWidget).toContainText('⏰ Test Countdown');
  
  // Should show countdown display with time segments
  await expect(countdownWidget).toContainText('Hours');
  await expect(countdownWidget).toContainText('Minutes');
  await expect(countdownWidget).toContainText('Seconds');
});

test('CountdownWidget handles configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a countdown widget with custom config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date to 30 minutes from now
    const targetDate = new Date();
    targetDate.setMinutes(targetDate.getMinutes() + 30);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Custom Countdown',
      showDays: false,
      showHours: true,
      showMinutes: true,
      showSeconds: false,
      format: 'digital'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget renders with custom config
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  
  // Should show custom title
  await expect(countdownWidget).toContainText('Custom Countdown');
  
  // Should show only configured time segments
  await expect(countdownWidget).toContainText('Minutes');
  // Should not show seconds (disabled in config)
  const content = await page.evaluate(() => {
    const widget = document.querySelector('countdown-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  expect(content).not.toContain('Seconds');
});

test('CountdownWidget text format', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add countdown widget with text format
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date to 2 hours from now
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 2);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Text Format Countdown',
      format: 'text'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  
  // Should show text format (e.g., "2 hours, 0 minutes")
  const content = await page.evaluate(() => {
    const widget = document.querySelector('countdown-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  expect(content).toMatch(/\d+\s+(hour|minute|second)/);
});

test('CountdownWidget completed state', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add countdown widget with past target date
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date to past (1 hour ago)
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() - 1);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Completed Countdown',
      completedMessage: 'Time is up!'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  
  // Should show completed message
  await expect(countdownWidget).toContainText('Time is up!');
  
  // Should show completion icon
  await expect(countdownWidget).toContainText('🎉');
});

test('CountdownWidget auto refresh', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add countdown widget with auto refresh
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date to 10 seconds from now
    const targetDate = new Date();
    targetDate.setSeconds(targetDate.getSeconds() + 10);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Auto Refresh Test',
      autoRefresh: true,
      format: 'digital'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const countdownWidget = page.locator('countdown-widget').last();
  
  // Get initial seconds value
  const initialContent = await page.evaluate(() => {
    const widget = document.querySelector('countdown-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  
  // Wait for auto refresh (should update every second)
  await page.waitForTimeout(2000);
  
  const updatedContent = await page.evaluate(() => {
    const widget = document.querySelector('countdown-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  
  // Content should have changed (countdown progressed)
  expect(updatedContent).not.toBe(initialContent);
});

test('CountdownWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a countdown widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const countdownWidget = document.createElement('countdown-widget');
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const countdownWidget = document.querySelector('countdown-widget');
    if (!countdownWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof countdownWidget.init === 'function';
    const hasRefresh = typeof countdownWidget.refresh === 'function';
    const hasDestroy = typeof countdownWidget.destroy === 'function';
    
    // Test countdown-specific methods
    const hasGetTargetDate = typeof countdownWidget.getTargetDate === 'function';
    const hasCalculateTimeRemaining = typeof countdownWidget.calculateTimeRemaining === 'function';
    const hasStartCountdown = typeof countdownWidget.startCountdown === 'function';
    const hasStopCountdown = typeof countdownWidget.stopCountdown === 'function';
    const hasUpdateDisplay = typeof countdownWidget.updateDisplay === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasGetTargetDate, hasCalculateTimeRemaining, hasStartCountdown, hasStopCountdown, hasUpdateDisplay };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasGetTargetDate).toBe(true);
  expect(result.hasCalculateTimeRemaining).toBe(true);
  expect(result.hasStartCountdown).toBe(true);
  expect(result.hasStopCountdown).toBe(true);
  expect(result.hasUpdateDisplay).toBe(true);
});

test('CountdownWidget different time units', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add countdown widget with very short time
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date to 2 minutes from now
    const targetDate = new Date();
    targetDate.setMinutes(targetDate.getMinutes() + 2);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Time Units Test',
      format: 'digital'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  
  // Should show minutes in format "01" or "02"
  const content = await page.evaluate(() => {
    const widget = document.querySelector('countdown-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  expect(content).toMatch(/0[12]/);
});

test('CountdownWidget handles empty configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add countdown widget with no specific config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const countdownWidget = document.createElement('countdown-widget');
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render with default configuration (1 hour from now)
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  await expect(countdownWidget).toContainText('⏰ Countdown');
  
  // Should show some time remaining (default 1 hour)
  await expect(countdownWidget).toContainText('Minutes');
});

test('CountdownWidget timezone handling', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with timezone configuration
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Set target date
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 3);
    
    const countdownWidget = document.createElement('countdown-widget');
    countdownWidget.setAttribute('config', JSON.stringify({
      targetDate: targetDate.toISOString(),
      title: 'Timezone Test',
      timezone: 'local'
    }));
    container.appendChild(countdownWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const countdownWidget = page.locator('countdown-widget').last();
  await expect(countdownWidget).toBeVisible();
  
  // Should render without errors
  await expect(countdownWidget).toContainText('Timezone Test');
});

