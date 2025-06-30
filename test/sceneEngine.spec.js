import { test, expect } from '@playwright/test';

test('scene engine basic functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Check if the scene container exists
  await expect(page.locator('.scene-layout')).toBeVisible();
  
  // Check if widgets are rendered
  await expect(page.locator('clock-widget')).toBeVisible();
  await expect(page.locator('weather-widget')).toBeVisible();
});

test('scene engine layout and positioning', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Wait for scene to load
  await page.waitForTimeout(1000);
  
  // Check that scene layout is properly structured
  const sceneLayout = page.locator('.scene-layout');
  await expect(sceneLayout).toBeVisible();
  
  // Verify widgets are positioned within the scene
  const widgets = await page.locator('.scene-layout [class*="widget"]').count();
  expect(widgets).toBeGreaterThan(0);
  
  // Check that widgets have proper CSS positioning
  const widgetPositions = await page.evaluate(() => {
    const widgets = document.querySelectorAll('.scene-layout [class*="widget"]');
    return Array.from(widgets).map(widget => {
      const style = window.getComputedStyle(widget);
      return {
        position: style.position,
        display: style.display,
        width: style.width,
        height: style.height
      };
    });
  });
  
  // Verify widgets have valid positioning
  widgetPositions.forEach(pos => {
    expect(pos.display).not.toBe('none');
    expect(pos.width).not.toBe('0px');
    expect(pos.height).not.toBe('0px');
  });
});

test('scene engine configuration loading', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test that scene engine loads and applies configuration
  const sceneConfig = await page.evaluate(() => {
    // Check if scene engine has configuration
    return {
      hasSceneEngine: typeof window.sceneEngine !== 'undefined',
      hasConfig: document.querySelector('.scene-layout') !== null,
      widgetCount: document.querySelectorAll('.scene-layout [class*="widget"]').length
    };
  });
  
  expect(sceneConfig.hasConfig).toBe(true);
  expect(sceneConfig.widgetCount).toBeGreaterThan(0);
});

test('scene engine widget mounting', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Wait for initial scene load
  await page.waitForTimeout(1000);
  
  // Test dynamic widget mounting
  const initialWidgetCount = await page.locator('.scene-layout [class*="widget"]').count();
  
  // Add a new widget dynamically
  await page.evaluate(() => {
    const container = document.querySelector('.scene-layout');
    if (container) {
      const newWidget = document.createElement('countdown-widget');
      newWidget.setAttribute('config', JSON.stringify({
        targetDate: new Date(Date.now() + 3600000).toISOString(),
        title: 'Dynamic Test Widget'
      }));
      container.appendChild(newWidget);
    }
  });
  
  // Wait for widget to mount
  await page.waitForTimeout(500);
  
  // Check that widget count increased
  const newWidgetCount = await page.locator('.scene-layout [class*="widget"]').count();
  expect(newWidgetCount).toBeGreaterThanOrEqual(initialWidgetCount + 1);
  
  // Verify the new widget is visible and functional
  await expect(page.locator('countdown-widget').last()).toBeVisible();
  await expect(page.locator('countdown-widget').last()).toContainText('Dynamic Test Widget');
});

test('scene engine responsive behavior', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test different viewport sizes
  const viewports = [
    { width: 1920, height: 1080 }, // Desktop
    { width: 1024, height: 768 },  // Tablet
    { width: 375, height: 667 }    // Mobile
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);
    
    // Verify scene layout adapts
    const sceneLayout = page.locator('.scene-layout');
    await expect(sceneLayout).toBeVisible();
    
    // Check that widgets remain visible and functional
    const visibleWidgets = await page.locator('.scene-layout [class*="widget"]:visible').count();
    expect(visibleWidgets).toBeGreaterThan(0);
    
    // Verify no layout overflow
    const hasOverflow = await page.evaluate(() => {
      const scene = document.querySelector('.scene-layout');
      return scene ? scene.scrollWidth > scene.clientWidth : false;
    });
    
    // Allow some overflow on mobile as it's expected
    if (viewport.width >= 768) {
      expect(hasOverflow).toBe(false);
    }
  }
}); 