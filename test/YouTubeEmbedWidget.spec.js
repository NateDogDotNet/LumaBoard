import { test, expect } from '@playwright/test';

test('YouTubeEmbedWidget displays and loads video', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a YouTube embed widget to test
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const youtubeWidget = document.createElement('youtube-widget');
    youtubeWidget.setAttribute('config', JSON.stringify({
      videoId: 'dQw4w9WgXcQ',
      autoplay: false,
      controls: true
    }));
    container.appendChild(youtubeWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if YouTube widget is visible
  const youtubeWidget = page.locator('youtube-widget').last();
  await expect(youtubeWidget).toBeVisible();
  
  // Should show the header with YouTube icon
  await expect(youtubeWidget).toContainText('📺 YouTube');
  
  // Should contain an iframe for the video
  const iframe = youtubeWidget.locator('iframe');
  await expect(iframe).toBeVisible();
  
  // Check iframe src contains YouTube embed URL
  const iframeSrc = await iframe.getAttribute('src');
  expect(iframeSrc).toContain('youtube.com/embed');
  expect(iframeSrc).toContain('dQw4w9WgXcQ');
});

test('YouTubeEmbedWidget handles playlist configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a YouTube widget with playlist config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const youtubeWidget = document.createElement('youtube-widget');
    youtubeWidget.setAttribute('config', JSON.stringify({
      playlist: ['dQw4w9WgXcQ', 'oHg5SJYRHA0', 'SQoA_wjmE9w'],
      autoplay: false,
      controls: true
    }));
    container.appendChild(youtubeWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that playlist controls are visible
  const youtubeWidget = page.locator('youtube-widget').last();
  await expect(youtubeWidget).toContainText('1/3'); // Playlist info
  
  // Should have navigation buttons
  const prevBtn = youtubeWidget.locator('button').first();
  const nextBtn = youtubeWidget.locator('button').last();
  await expect(prevBtn).toBeVisible();
  await expect(nextBtn).toBeVisible();
});

test('YouTubeEmbedWidget playlist navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add YouTube widget with playlist
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const youtubeWidget = document.createElement('youtube-widget');
    youtubeWidget.setAttribute('config', JSON.stringify({
      playlist: ['dQw4w9WgXcQ', 'oHg5SJYRHA0', 'SQoA_wjmE9w'],
      autoplay: false
    }));
    container.appendChild(youtubeWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const youtubeWidget = page.locator('youtube-widget').last();
  
  // Test next video navigation
  const nextBtn = youtubeWidget.locator('button').last();
  await nextBtn.click();
  await page.waitForTimeout(500);
  
  // Should show video 2/3
  await expect(youtubeWidget).toContainText('2/3');
  
  // Test previous video navigation
  const prevBtn = youtubeWidget.locator('button').first();
  await prevBtn.click();
  await page.waitForTimeout(500);
  
  // Should be back to video 1/3
  await expect(youtubeWidget).toContainText('1/3');
});

test('YouTubeEmbedWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a YouTube widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const youtubeWidget = document.createElement('youtube-widget');
    container.appendChild(youtubeWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const youtubeWidget = document.querySelector('youtube-widget');
    if (!youtubeWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof youtubeWidget.init === 'function';
    const hasRefresh = typeof youtubeWidget.refresh === 'function';
    const hasDestroy = typeof youtubeWidget.destroy === 'function';
    
    // Test YouTube-specific methods
    const hasNextVideo = typeof youtubeWidget.nextVideo === 'function';
    const hasPreviousVideo = typeof youtubeWidget.previousVideo === 'function';
    const hasGetCurrentVideoId = typeof youtubeWidget.getCurrentVideoId === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasNextVideo, hasPreviousVideo, hasGetCurrentVideoId };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasNextVideo).toBe(true);
  expect(result.hasPreviousVideo).toBe(true);
  expect(result.hasGetCurrentVideoId).toBe(true);
});

test('YouTubeEmbedWidget handles empty configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add YouTube widget with no specific config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const youtubeWidget = document.createElement('youtube-widget');
    container.appendChild(youtubeWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render with default video
  const youtubeWidget = page.locator('youtube-widget').last();
  await expect(youtubeWidget).toBeVisible();
  await expect(youtubeWidget).toContainText('📺 YouTube');
  
  // Should have default video ID
  const iframe = youtubeWidget.locator('iframe');
  const iframeSrc = await iframe.getAttribute('src');
  expect(iframeSrc).toContain('youtube.com/embed');
});

test('YouTubeEmbedWidget autoplay and controls configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with autoplay enabled and controls disabled
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const youtubeWidget = document.createElement('youtube-widget');
    youtubeWidget.setAttribute('config', JSON.stringify({
      videoId: 'dQw4w9WgXcQ',
      autoplay: true,
      controls: false,
      mute: true
    }));
    container.appendChild(youtubeWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const youtubeWidget = page.locator('youtube-widget').last();
  const iframe = youtubeWidget.locator('iframe');
  const iframeSrc = await iframe.getAttribute('src');
  
  // Check that autoplay and controls parameters are set correctly
  expect(iframeSrc).toContain('autoplay=1');
  expect(iframeSrc).toContain('controls=0');
  expect(iframeSrc).toContain('mute=1');
}); 