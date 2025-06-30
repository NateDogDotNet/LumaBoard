import { test, expect } from '@playwright/test';

test('ImageSlideshowWidget displays and loads images', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Create slideshow widget with test images
  await page.evaluate(() => {
    const config = {
      images: [
        { url: 'https://picsum.photos/800/600?random=1', caption: 'Image 1' },
        { url: 'https://picsum.photos/800/600?random=2', caption: 'Image 2' },
        { url: 'https://picsum.photos/800/600?random=3', caption: 'Image 3' }
      ],
      autoplay: false,
      showControls: true,
      showCaptions: true
    };

    const container = document.querySelector('.widget-container[data-position="0"]');
    if (container) {
      const widget = document.createElement('image-slideshow-widget');
      widget.setAttribute('config', JSON.stringify(config));
      container.appendChild(widget);
    }
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if slideshow widget is visible
  const slideshowWidget = page.locator('image-slideshow-widget').last();
  await expect(slideshowWidget).toBeVisible();
  
  // Should show the header
  await expect(slideshowWidget).toContainText('🖼️ Slideshow');
  
  // Should have slideshow container
  const slideContainer = slideshowWidget.locator('.slideshow-container');
  await expect(slideContainer).toBeVisible();
});

test('ImageSlideshowWidget handles configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a slideshow widget with custom config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const slideshowWidget = document.createElement('image-slideshow-widget');
    slideshowWidget.setAttribute('config', JSON.stringify({
      images: [
        { url: 'https://picsum.photos/800/600?random=10', caption: 'Custom Image 1' },
        { url: 'https://picsum.photos/800/600?random=11', caption: 'Custom Image 2' }
      ],
      interval: 3,
      transition: 'fade',
      showIndicators: true
    }));
    container.appendChild(slideshowWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget renders with custom config
  const slideshowWidget = page.locator('image-slideshow-widget').last();
  await expect(slideshowWidget).toBeVisible();
  
  // Should show indicators for 2 images
  const indicators = slideshowWidget.locator('.indicator');
  await expect(indicators).toHaveCount(2);
});

test('ImageSlideshowWidget navigation controls', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add slideshow widget with multiple images
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const slideshowWidget = document.createElement('image-slideshow-widget');
    slideshowWidget.setAttribute('config', JSON.stringify({
      images: [
        { url: 'https://picsum.photos/800/600?random=20', caption: 'Test Image 1' },
        { url: 'https://picsum.photos/800/600?random=21', caption: 'Test Image 2' },
        { url: 'https://picsum.photos/800/600?random=22', caption: 'Test Image 3' }
      ],
      autoplay: false,
      showControls: true
    }));
    container.appendChild(slideshowWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const slideshowWidget = page.locator('image-slideshow-widget').last();
  
  // Should have navigation controls
  const nextBtn = slideshowWidget.locator('.next-btn');
  const prevBtn = slideshowWidget.locator('.prev-btn');
  await expect(nextBtn).toBeVisible();
  await expect(prevBtn).toBeVisible();
  
  // Test navigation
  await nextBtn.click();
  await page.waitForTimeout(500);
  
  // Should show second image caption
  await expect(slideshowWidget).toContainText('Test Image 2');
  
  // Test previous navigation
  await prevBtn.click();
  await page.waitForTimeout(500);
  
  // Should be back to first image
  await expect(slideshowWidget).toContainText('Test Image 1');
});

test('ImageSlideshowWidget autoplay functionality', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add slideshow widget with autoplay
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const slideshowWidget = document.createElement('image-slideshow-widget');
    slideshowWidget.setAttribute('config', JSON.stringify({
      images: [
        { url: 'https://picsum.photos/800/600?random=30', caption: 'Auto Image 1' },
        { url: 'https://picsum.photos/800/600?random=31', caption: 'Auto Image 2' }
      ],
      autoplay: true,
      interval: 2, // 2 seconds for faster testing
      showCaptions: true
    }));
    container.appendChild(slideshowWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const slideshowWidget = page.locator('image-slideshow-widget').last();
  
  // Should start with first image
  await expect(slideshowWidget).toContainText('Auto Image 1');
  
  // Wait for autoplay to advance (2 seconds + buffer)
  await page.waitForTimeout(2500);
  
  // Should have advanced to second image
  await expect(slideshowWidget).toContainText('Auto Image 2');
});

test('ImageSlideshowWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a slideshow widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const slideshowWidget = document.createElement('image-slideshow-widget');
    container.appendChild(slideshowWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const slideshowWidget = document.querySelector('image-slideshow-widget');
    if (!slideshowWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof slideshowWidget.init === 'function';
    const hasRefresh = typeof slideshowWidget.refresh === 'function';
    const hasDestroy = typeof slideshowWidget.destroy === 'function';
    
    // Test slideshow-specific methods
    const hasNextSlide = typeof slideshowWidget.nextSlide === 'function';
    const hasPreviousSlide = typeof slideshowWidget.previousSlide === 'function';
    const hasGoToSlide = typeof slideshowWidget.goToSlide === 'function';
    const hasStartSlideshow = typeof slideshowWidget.startSlideshow === 'function';
    const hasStopSlideshow = typeof slideshowWidget.stopSlideshow === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasNextSlide, hasPreviousSlide, hasGoToSlide, hasStartSlideshow, hasStopSlideshow };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasNextSlide).toBe(true);
  expect(result.hasPreviousSlide).toBe(true);
  expect(result.hasGoToSlide).toBe(true);
  expect(result.hasStartSlideshow).toBe(true);
  expect(result.hasStopSlideshow).toBe(true);
});

test('ImageSlideshowWidget transition effects', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test fade transition
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const slideshowWidget = document.createElement('image-slideshow-widget');
    slideshowWidget.setAttribute('config', JSON.stringify({
      images: [
        { url: 'https://picsum.photos/800/600?random=40', caption: 'Fade Image 1' },
        { url: 'https://picsum.photos/800/600?random=41', caption: 'Fade Image 2' }
      ],
      transition: 'fade',
      autoplay: false
    }));
    container.appendChild(slideshowWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const slideshowWidget = page.locator('image-slideshow-widget').last();
  await expect(slideshowWidget).toBeVisible();
  
  // Should have slides with opacity transitions for fade effect
  const slides = slideshowWidget.locator('.slide');
  await expect(slides.first()).toBeVisible();
});

test('ImageSlideshowWidget handles empty images array', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add slideshow widget with no images
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const slideshowWidget = document.createElement('image-slideshow-widget');
    slideshowWidget.setAttribute('config', JSON.stringify({
      images: []
    }));
    container.appendChild(slideshowWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render without errors
  const slideshowWidget = page.locator('image-slideshow-widget').last();
  await expect(slideshowWidget).toBeVisible();
  await expect(slideshowWidget).toContainText('🖼️ Slideshow');
}); 