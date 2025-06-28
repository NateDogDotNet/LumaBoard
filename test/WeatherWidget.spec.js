import { test, expect } from '@playwright/test';

test('WeatherWidget displays and loads data', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check if weather widget is visible
  const weatherWidget = page.locator('weather-widget');
  await expect(weatherWidget).toBeVisible();
  
  // Should show location even if loading
  await expect(weatherWidget).toContainText('Minneapolis');
  
  // Wait for potential data loading
  await page.waitForTimeout(3000);
  
  // Check if temperature format is displayed (could be loading state)
  const content = await weatherWidget.textContent();
  expect(content).toMatch(/\d+°|--°/);
});

test('WeatherWidget handles configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a weather widget with custom config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const weatherWidget = document.createElement('weather-widget');
    weatherWidget.config = {
      location: 'London',
      units: 'celsius',
      refreshInterval: 15
    };
    container.appendChild(weatherWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the custom location is displayed
  const customWeather = page.locator('weather-widget').last();
  await expect(customWeather).toContainText('London');
});

test('WeatherWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const weatherWidget = document.querySelector('weather-widget');
    if (!weatherWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof weatherWidget.init === 'function';
    const hasRefresh = typeof weatherWidget.refresh === 'function';
    const hasDestroy = typeof weatherWidget.destroy === 'function';
    
    return { hasInit, hasRefresh, hasDestroy };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
});

test('WeatherWidget caching functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test caching methods
  const cachingTest = await page.evaluate(() => {
    const weatherWidget = document.querySelector('weather-widget');
    if (!weatherWidget) return false;
    
    // Test that caching methods exist
    const hasCacheMethod = typeof weatherWidget.cacheWeatherData === 'function';
    const hasGetCachedMethod = typeof weatherWidget.getCachedWeatherData === 'function';
    
    return { hasCacheMethod, hasGetCachedMethod };
  });
  
  expect(cachingTest.hasCacheMethod).toBe(true);
  expect(cachingTest.hasGetCachedMethod).toBe(true);
}); 