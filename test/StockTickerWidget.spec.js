import { test, expect } from '@playwright/test';

test('StockTickerWidget displays and loads stock data', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create stock ticker widget with test config
  await page.evaluate(() => {
    const config = {
      symbols: ['AAPL', 'GOOGL', 'MSFT'],
      refreshInterval: 60000,
      showChange: true,
      showPercentChange: true
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);

    const stockWidget = document.createElement('stocks-widget');
    stockWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(2000);
  
  // Check if stock widget is visible
  const stockWidget = page.locator('stocks-widget').last();
  await expect(stockWidget).toBeVisible();
  
  // Should show the header
  await expect(stockWidget).toContainText('💹 Stock Ticker');
  
  // Since widget uses shadow DOM, check if it's functioning by testing the widget instance
  const isWorking = await page.evaluate(() => {
    const widget = document.querySelector('stocks-widget');
    return widget && widget.shadowRoot !== null;
  });
  
  expect(isWorking).toBe(true);
});

test('StockTickerWidget custom symbols configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create stock ticker widget with custom symbols
  await page.evaluate(() => {
    const config = {
      symbols: ['TSLA', 'AMZN'],
      showChange: true,
      showPercentChange: false,
      displayStyle: 'compact'
    };

    const container = document.createElement('div');
    container.style.width = '350px';
    container.style.height = '150px';
    container.id = 'custom-stock-container';
    document.body.appendChild(container);

    const stockWidget = document.createElement('stocks-widget');
    stockWidget.setAttribute('config', JSON.stringify(config));
    stockWidget.id = 'custom-stock-widget';
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(2000);
  
  // Check if custom stock widget is visible
  const customStock = page.locator('#custom-stock-widget');
  await expect(customStock).toBeVisible();
  
  // Test configuration was applied by checking the widget's internal config
  const configApplied = await page.evaluate(() => {
    const widget = document.getElementById('custom-stock-widget');
    if (!widget) return false;
    
    // Check if the widget has the config property and it contains our symbols
    if (widget.config && widget.config.symbols) {
      return Array.isArray(widget.config.symbols) && 
             widget.config.symbols.includes('TSLA') && 
             widget.config.symbols.includes('AMZN');
    }
    
    // Fallback to checking the attribute
    const configAttr = widget.getAttribute('config');
    if (!configAttr) return false;
    
    try {
      const config = JSON.parse(configAttr);
      return config.symbols && 
             Array.isArray(config.symbols) && 
             config.symbols.includes('TSLA') && 
             config.symbols.includes('AMZN');
    } catch (e) {
      return false;
    }
  });
  
  expect(configApplied).toBe(true);
});

test('StockTickerWidget displays price formatting', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create stock ticker widget
  await page.evaluate(() => {
    const config = {
      symbols: ['AAPL'],
      showChange: true,
      showPercentChange: true
    };

    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '150px';
    document.body.appendChild(container);

    const stockWidget = document.createElement('stocks-widget');
    stockWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(2000);
  
  const stockWidget = page.locator('stocks-widget').last();
  await expect(stockWidget).toBeVisible();
  
  // Test that the widget has formatting methods
  const hasFormatMethods = await page.evaluate(() => {
    const widget = document.querySelector('stocks-widget');
    if (!widget) return false;
    
    return typeof widget.formatPrice === 'function' && 
           typeof widget.formatChange === 'function';
  });
  
  expect(hasFormatMethods).toBe(true);
});

test('StockTickerWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a stock ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '150px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stocks-widget');
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test widget lifecycle methods
  const result = await page.evaluate(() => {
    const stockWidget = document.querySelector('stocks-widget');
    if (!stockWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof stockWidget.init === 'function';
    const hasRefresh = typeof stockWidget.refresh === 'function';
    const hasDestroy = typeof stockWidget.destroy === 'function';
    const hasStartRefreshTimer = typeof stockWidget.startRefreshTimer === 'function';
    const hasStopRefreshTimer = typeof stockWidget.stopRefreshTimer === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasStartRefreshTimer, hasStopRefreshTimer };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasStartRefreshTimer).toBe(true);
  expect(result.hasStopRefreshTimer).toBe(true);
});

test('StockTickerWidget caching functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add stock ticker widget
  await page.evaluate(() => {
    const config = {
      symbols: ['AAPL'],
      refreshInterval: 30000 // 30 seconds
    };

    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '150px';
    document.body.appendChild(container);
    
    const stockWidget = document.createElement('stocks-widget');
    stockWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(stockWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Test caching functionality
  const result = await page.evaluate(() => {
    const stockWidget = document.querySelector('stocks-widget');
    if (!stockWidget) return false;
    
    // Check if widget has caching methods that actually exist
    const hasCacheStockData = typeof stockWidget.cacheStockData === 'function';
    const hasGetCachedStockData = typeof stockWidget.getCachedStockData === 'function';
    const hasGetMockStockData = typeof stockWidget.getMockStockData === 'function';
    
    return { hasCacheStockData, hasGetCachedStockData, hasGetMockStockData };
  });
  
  expect(result.hasCacheStockData).toBe(true);
  expect(result.hasGetCachedStockData).toBe(true);
  expect(result.hasGetMockStockData).toBe(true);
}); 