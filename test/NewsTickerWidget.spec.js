import { test, expect } from '@playwright/test';

test('NewsTickerWidget displays and loads news', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a news ticker widget to test
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-ticker-widget');
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if news ticker widget is visible
  const newsWidget = page.locator('news-ticker-widget').last();
  await expect(newsWidget).toBeVisible();
  
  // Should show the header
  await expect(newsWidget).toContainText('News Ticker');
  
  // Wait for potential data loading
  await page.waitForTimeout(2000);
  
  // Should show either loading state or news content
  const content = await newsWidget.textContent();
  expect(content).toMatch(/Loading news|Technology News|Global Markets|Climate Change|Sports Update/);
});

test('NewsTickerWidget handles configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a news ticker widget with custom config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-ticker-widget');
    newsWidget.config = {
      feedUrl: 'https://feeds.bbci.co.uk/news/rss.xml',
      refreshInterval: 10,
      maxItems: 5
    };
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget exists and renders
  const customNews = page.locator('news-ticker-widget').last();
  await expect(customNews).toBeVisible();
});

test('NewsTickerWidget scrolling animation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a news ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-ticker-widget');
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render and load data
  await page.waitForTimeout(2000);
  
  // Check if scrolling animation exists
  const tickerContent = page.locator('news-ticker-widget .ticker-content').last();
  
  if (await tickerContent.count() > 0) {
    // Check if animation is applied
    const animationName = await tickerContent.evaluate(el => 
      getComputedStyle(el).animationName
    );
    expect(animationName).toContain('scroll-left');
  }
});

test('NewsTickerWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a news ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-ticker-widget');
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const newsWidget = document.querySelector('news-ticker-widget');
    if (!newsWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof newsWidget.init === 'function';
    const hasRefresh = typeof newsWidget.refresh === 'function';
    const hasDestroy = typeof newsWidget.destroy === 'function';
    
    return { hasInit, hasRefresh, hasDestroy };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
});

test('NewsTickerWidget caching functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a news ticker widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '200px';
    document.body.appendChild(container);
    
    const newsWidget = document.createElement('news-ticker-widget');
    container.appendChild(newsWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test caching methods
  const cachingTest = await page.evaluate(() => {
    const newsWidget = document.querySelector('news-ticker-widget');
    if (!newsWidget) return false;
    
    // Test that caching methods exist
    const hasCacheMethod = typeof newsWidget.cacheNewsData === 'function';
    const hasGetCachedMethod = typeof newsWidget.getCachedNewsData === 'function';
    
    return { hasCacheMethod, hasGetCachedMethod };
  });
  
  expect(cachingTest.hasCacheMethod).toBe(true);
  expect(cachingTest.hasGetCachedMethod).toBe(true);
}); 