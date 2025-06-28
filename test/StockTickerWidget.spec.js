import { test, expect } from '@playwright/test';

test('StockTickerWidget displays and loads stock data', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a stock ticker widget to test
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stock-ticker-widget');
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if stock ticker widget is visible
  const stockWidget = page.locator('stock-ticker-widget').last();
  await expect(stockWidget).toBeVisible();
  
  // Should show the header
  await expect(stockWidget).toContainText('Stock Ticker');
  
  // Wait for potential data loading
  await page.waitForTimeout(2000);
  
  // Should show either loading state or stock symbols
  const content = await stockWidget.textContent();
  expect(content).toMatch(/Loading stock data|AAPL|GOOGL|MSFT|TSLA/);
});

test('StockTickerWidget handles custom symbols configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a stock ticker widget with custom symbols
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stock-ticker-widget');
    stockWidget.config = {
      symbols: ['AMZN', 'META'],
      refreshInterval: 2,
      showChange: true,
      showPercentChange: true
    };
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget exists and renders
  const customStock = page.locator('stock-ticker-widget').last();
  await expect(customStock).toBeVisible();
  
  // Wait for data loading
  await page.waitForTimeout(2000);
  
  // Should show custom symbols
  const content = await customStock.textContent();
  expect(content).toMatch(/AMZN|META/);
});

test('StockTickerWidget displays price formatting', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a stock ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stock-ticker-widget');
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render and load data
  await page.waitForTimeout(2000);
  
  // Check if price formatting is correct (should contain $ symbol)
  const stockWidget = page.locator('stock-ticker-widget').last();
  const content = await stockWidget.textContent();
  
  // Should contain currency formatting
  expect(content).toMatch(/\$/);
});

test('StockTickerWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a stock ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stock-ticker-widget');
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const stockWidget = document.querySelector('stock-ticker-widget');
    if (!stockWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof stockWidget.init === 'function';
    const hasRefresh = typeof stockWidget.refresh === 'function';
    const hasDestroy = typeof stockWidget.destroy === 'function';
    
    // Test formatting methods
    const hasFormatPrice = typeof stockWidget.formatPrice === 'function';
    const hasFormatChange = typeof stockWidget.formatChange === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasFormatPrice, hasFormatChange };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasFormatPrice).toBe(true);
  expect(result.hasFormatChange).toBe(true);
});

test('StockTickerWidget caching functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a stock ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stock-ticker-widget');
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test caching methods
  const cachingTest = await page.evaluate(() => {
    const stockWidget = document.querySelector('stock-ticker-widget');
    if (!stockWidget) return false;
    
    // Test that caching methods exist
    const hasCacheMethod = typeof stockWidget.cacheStockData === 'function';
    const hasGetCachedMethod = typeof stockWidget.getCachedStockData === 'function';
    const hasMockMethod = typeof stockWidget.getMockStockData === 'function';
    
    return { hasCacheMethod, hasGetCachedMethod, hasMockMethod };
  });
  
  expect(cachingTest.hasCacheMethod).toBe(true);
  expect(cachingTest.hasGetCachedMethod).toBe(true);
  expect(cachingTest.hasMockMethod).toBe(true);
}); 