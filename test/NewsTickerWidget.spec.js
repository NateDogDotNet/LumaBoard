import { test, expect } from '@playwright/test';

test('NewsTickerWidget displays and loads news', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create news ticker widget with test config
  await page.evaluate(() => {
    const config = {
      sources: ['techcrunch', 'bbc-news'],
      refreshInterval: 300000,
      maxItems: 10,
      showSource: true
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);

    const newsWidget = document.createElement('news-widget');
    newsWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(2000);
  
  // Check if news widget is visible
  const newsWidget = page.locator('news-widget').last();
  await expect(newsWidget).toBeVisible();
  
  // Should show the header
  await expect(newsWidget).toContainText('📰 News Ticker');
  
  // Should show loading or news content
  const content = await page.evaluate(() => {
    const widget = document.querySelector('news-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  expect(content).toMatch(/Loading|News|headlines|latest|Technology|Global|Climate|Sports/);
});

test('NewsTickerWidget custom sources configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create news ticker widget with custom sources
  await page.evaluate(() => {
    const config = {
      sources: ['reuters', 'ap-news'],
      category: 'business',
      showSource: true,
      scrollSpeed: 'medium'
    };

    const container = document.createElement('div');
    container.style.width = '450px';
    container.style.height = '180px';
    document.body.appendChild(container);

    const newsWidget = document.createElement('news-widget');
    newsWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(2000);
  
  // Check if custom news widget is visible
  const customNews = page.locator('news-widget').last();
  await expect(customNews).toBeVisible();
  
  // Should contain news content or loading state
  const content = await page.evaluate(() => {
    const widget = document.querySelector('news-widget');
    return widget?.shadowRoot?.textContent || '';
  });
  expect(content).toMatch(/Loading|News Ticker|headlines|news|Technology|Global|Climate|Sports/);
});

test('NewsTickerWidget scrolling functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create news ticker widget
  await page.evaluate(() => {
    const config = {
      sources: ['bbc-news'],
      scrollSpeed: 'fast',
      pauseOnHover: true
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '150px';
    document.body.appendChild(container);

    const newsWidget = document.createElement('news-widget');
    newsWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const newsWidget = page.locator('news-widget').last();
  await expect(newsWidget).toBeVisible();
  
  // Check if scrolling content exists
  const tickerContent = page.locator('news-widget .ticker-content').last();
  await expect(tickerContent).toBeVisible();
});

test('NewsTickerWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a news ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '150px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-widget');
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test widget lifecycle methods
  const result = await page.evaluate(() => {
    const newsWidget = document.querySelector('news-widget');
    if (!newsWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof newsWidget.init === 'function';
    const hasRefresh = typeof newsWidget.refresh === 'function';
    const hasDestroy = typeof newsWidget.destroy === 'function';
    const hasStartScrolling = typeof newsWidget.startScrolling === 'function';
    const hasStopScrolling = typeof newsWidget.stopScrolling === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasStartScrolling, hasStopScrolling };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasStartScrolling).toBe(true);
  expect(result.hasStopScrolling).toBe(true);
});

test('NewsTickerWidget caching functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add news ticker widget
  await page.evaluate(() => {
    const config = {
      sources: ['bbc-news'],
      refreshInterval: 300000 // 5 minutes
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '150px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-widget');
    newsWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Test caching functionality
  const result = await page.evaluate(() => {
    const newsWidget = document.querySelector('news-widget');
    if (!newsWidget) return false;
    
    // Check if widget has the actual caching methods
    const hasCacheNewsData = typeof newsWidget.cacheNewsData === 'function';
    const hasGetCachedNewsData = typeof newsWidget.getCachedNewsData === 'function';
    const hasLoadNewsData = typeof newsWidget.loadNewsData === 'function';
    
    return { hasCacheNewsData, hasGetCachedNewsData, hasLoadNewsData };
  });
  
  expect(result.hasCacheNewsData).toBe(true);
  expect(result.hasGetCachedNewsData).toBe(true);
  expect(result.hasLoadNewsData).toBe(true);
}); 