import { test, expect } from '@playwright/test';

test('VideoPlayerWidget displays and loads video', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget with test config
  await page.evaluate(() => {
    const config = {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      controls: true,
      muted: true
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    videoWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(2000);
  
  // Check if video widget is visible
  const videoWidget = page.locator('video-widget').last();
  await expect(videoWidget).toBeVisible();
  
  // Should show the header
  await expect(videoWidget).toContainText('🎬 Video Player');
  
  // Check video src is set by accessing the source elements in shadow DOM
  const videoSrc = await page.evaluate(() => {
    const widget = document.querySelector('video-widget');
    const videoElement = widget?.shadowRoot?.querySelector('.video-element');
    const sourceElement = videoElement?.querySelector('source');
    return sourceElement?.src || videoElement?.src || null;
  });
  
  expect(videoSrc).toContain('SampleVideo_1280x720_1mb.mp4');
});

test('VideoPlayerWidget handles playlist configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget with playlist
  await page.evaluate(() => {
    const config = {
      playlist: [
        { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', title: 'Video 1' },
        { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', title: 'Video 2' },
        { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4', title: 'Video 3' }
      ],
      controls: true,
      playlistAutoAdvance: true
    };

    const container = document.createElement('div');
    container.style.width = '500px';
    container.style.height = '400px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    videoWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that playlist controls are visible
  const videoWidget = page.locator('video-widget').last();
  await expect(videoWidget).toContainText('1/3'); // Playlist info
  
  // Should have navigation buttons
  const prevBtn = videoWidget.locator('button').first();
  const nextBtn = videoWidget.locator('button').last();
  await expect(prevBtn).toBeVisible();
  await expect(nextBtn).toBeVisible();
});

test('VideoPlayerWidget playlist navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget with playlist
  await page.evaluate(() => {
    const config = {
      playlist: [
        { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', title: 'Video 1' },
        { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4', title: 'Video 2' },
        { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4', title: 'Video 3' }
      ],
      controls: true
    };

    const container = document.createElement('div');
    container.style.width = '500px';
    container.style.height = '400px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    videoWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const videoWidget = page.locator('video-widget').last();
  
  // Should start with video 1/3
  await expect(videoWidget).toContainText('1/3');

  // Test next video navigation
  const nextBtn = videoWidget.locator('button').last();
  await nextBtn.click();
  await page.waitForTimeout(500);
  
  // Should show video 2/3
  await expect(videoWidget).toContainText('2/3');
  
  // Test previous video navigation
  const prevBtn = videoWidget.locator('button').first();
  await prevBtn.click();
  await page.waitForTimeout(500);
  
  // Should be back to video 1/3
  await expect(videoWidget).toContainText('1/3');
});

test('VideoPlayerWidget video controls', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget with controls
  await page.evaluate(() => {
    const config = {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      controls: true,
      muted: true,
      autoplay: false
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    videoWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const videoWidget = page.locator('video-widget').last();
  const videoElement = videoWidget.locator('video');
  
  // Check video has controls
  const hasControls = await videoElement.getAttribute('controls');
  expect(hasControls).not.toBeNull();
  
  // Check video is muted
  const isMuted = await videoElement.getAttribute('muted');
  expect(isMuted).not.toBeNull();
});

test('VideoPlayerWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a video widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const videoWidget = document.createElement('video-widget');
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test widget lifecycle methods
  const result = await page.evaluate(() => {
    const videoWidget = document.querySelector('video-widget');
    if (!videoWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof videoWidget.init === 'function';
    const hasRefresh = typeof videoWidget.refresh === 'function';
    const hasDestroy = typeof videoWidget.destroy === 'function';
    const hasNextVideo = typeof videoWidget.nextVideo === 'function';
    const hasPreviousVideo = typeof videoWidget.previousVideo === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasNextVideo, hasPreviousVideo };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasNextVideo).toBe(true);
  expect(result.hasPreviousVideo).toBe(true);
});

test('VideoPlayerWidget handles configuration options', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget with various options
  await page.evaluate(() => {
    const config = {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      autoplay: true,
      loop: true,
      muted: true,
      controls: false
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    videoWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const videoWidget = page.locator('video-widget').last();
  const videoElement = videoWidget.locator('video');
  
  // Check autoplay attribute
  const hasAutoplay = await videoElement.getAttribute('autoplay');
  expect(hasAutoplay).not.toBeNull();
  
  // Check loop attribute
  const hasLoop = await videoElement.getAttribute('loop');
  expect(hasLoop).not.toBeNull();
  
  // Check muted attribute
  const isMuted = await videoElement.getAttribute('muted');
  expect(isMuted).not.toBeNull();
  
  // Check controls attribute (should be absent)
  const hasControls = await videoElement.getAttribute('controls');
  expect(hasControls).toBeNull();
});

test('VideoPlayerWidget handles empty configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget without config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render without errors
  const videoWidget = page.locator('video-widget').last();
  await expect(videoWidget).toBeVisible();
  await expect(videoWidget).toContainText('🎬 Video Player');
  
  // Should show placeholder or no video message
  await expect(videoWidget).toContainText('No video configured');
});

test('VideoPlayerWidget error handling', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create video player widget with invalid URL
  await page.evaluate(() => {
    const config = {
      videoUrl: 'https://invalid-url.com/nonexistent-video.mp4'
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    const videoWidget = document.createElement('video-widget');
    videoWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(videoWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render the widget structure
  const videoWidget = page.locator('video-widget').last();
  await expect(videoWidget).toBeVisible();
  
  // Video element should exist even with invalid URL
  const videoElement = videoWidget.locator('video');
  await expect(videoElement).toBeVisible();
}); 