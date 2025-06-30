import { test, expect } from "@playwright/test";

test('Performance - page load time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('http://localhost:5173');
  const initialLoadTime = Date.now() - startTime;
  
  await page.waitForTimeout(2000);
  const fullLoadTime = Date.now() - startTime;
  
  // Performance expectations for a dashboard app
  expect(initialLoadTime).toBeLessThan(5000); // Should load within 5 seconds
  expect(fullLoadTime).toBeLessThan(10000); // Full render within 10 seconds
});

test('Performance - widget rendering speed', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test widget rendering performance
  const renderingPerformance = await page.evaluate(() => {
    const results = [];
    const widgetTypes = ['clock-widget', 'weather-widget', 'countdown-widget'];
    
    widgetTypes.forEach(widgetType => {
      const startTime = performance.now();
      
      const container = document.createElement('div');
      container.style.width = '300px';
      container.style.height = '200px';
      document.body.appendChild(container);
      
      const widget = document.createElement(widgetType);
      if (widgetType === 'countdown-widget') {
        widget.setAttribute('config', JSON.stringify({
          targetDate: new Date(Date.now() + 3600000).toISOString(),
          title: 'Performance Test'
        }));
      }
      container.appendChild(widget);
      
      const renderTime = performance.now() - startTime;
      
      results.push({
        widgetType,
        renderTime,
        hasElement: !!widget,
        hasShadowRoot: !!widget.shadowRoot
      });
    });
    
    return results;
  });
  
  // Each widget should render quickly (under 100ms)
  renderingPerformance.forEach(result => {
    expect(result.renderTime).toBeLessThan(100);
    expect(result.hasElement).toBe(true);
  });
});

test('Performance - concurrent widget updates', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Test performance under concurrent updates
  const concurrencyTest = await page.evaluate(async () => {
    const widgets = [];
    
    // Create multiple updating widgets
    for (let i = 0; i < 10; i++) {
      const container = document.createElement('div');
      container.style.width = '200px';
      container.style.height = '150px';
      document.body.appendChild(container);
      
      const widget = document.createElement('countdown-widget');
      widget.setAttribute('config', JSON.stringify({
        targetDate: new Date(Date.now() + 3600000).toISOString(),
        title: `Concurrent Test ${i}`,
        autoRefresh: true
      }));
      container.appendChild(widget);
      widgets.push(widget);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const startTime = performance.now();
    
    // Trigger concurrent updates
    const updatePromises = widgets.map(widget => {
      return new Promise(resolve => {
        if (typeof widget.refresh === 'function') {
          widget.refresh();
        }
        resolve();
      });
    });
    
    await Promise.all(updatePromises);
    const updateTime = performance.now() - startTime;
    
    return {
      widgetCount: widgets.length,
      concurrentUpdateTime: updateTime,
      averageUpdateTime: updateTime / widgets.length
    };
  });
  
  expect(concurrencyTest.widgetCount).toBe(10);
  // Concurrent updates should complete quickly (under 500ms total)
  expect(concurrencyTest.concurrentUpdateTime).toBeLessThan(500);
  // Average per widget should be very fast
  expect(concurrencyTest.averageUpdateTime).toBeLessThan(50);
});

test('Performance - large scene stress test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test performance with a large number of widgets in a scene
  const stressTest = await page.evaluate(async () => {
    const sceneContainer = document.querySelector('.scene-layout') || document.body;
    const startTime = performance.now();
    const widgets = [];
    
    // Create a stress test scenario
    for (let i = 0; i < 15; i++) {
      const container = document.createElement('div');
      container.style.width = '150px';
      container.style.height = '100px';
      container.style.display = 'inline-block';
      container.style.margin = '5px';
      sceneContainer.appendChild(container);
      
      // Mix different widget types
      const widgetTypes = ['clock-widget', 'countdown-widget'];
      const widgetType = widgetTypes[i % widgetTypes.length];
      
      const widget = document.createElement(widgetType);
      if (widgetType === 'countdown-widget') {
        widget.setAttribute('config', JSON.stringify({
          targetDate: new Date(Date.now() + (i * 60000)).toISOString(),
          title: `Stress ${i}`
        }));
      }
      container.appendChild(widget);
      widgets.push(widget);
      
      // Small delay to prevent blocking
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    const creationTime = performance.now() - startTime;
    
    // Test responsiveness after creation
    const interactionStart = performance.now();
    
    // Simulate user interactions
    widgets.forEach((widget, index) => {
      if (index % 3 === 0 && typeof widget.refresh === 'function') {
        widget.refresh();
      }
    });
    
    const interactionTime = performance.now() - interactionStart;
    
    return {
      widgetCount: widgets.length,
      creationTime,
      interactionTime,
      averageCreationTime: creationTime / widgets.length,
      systemResponsive: interactionTime < 100
    };
  });
  
  expect(stressTest.widgetCount).toBe(15);
  // System should handle stress test reasonably (under 2 seconds creation)
  expect(stressTest.creationTime).toBeLessThan(2000);
  // System should remain responsive
  expect(stressTest.systemResponsive).toBe(true);
});

test('Performance - resource cleanup verification', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test that resources are properly cleaned up
  const cleanupTest = await page.evaluate(async () => {
    const widgets = [];
    
    // Create widgets with timers/intervals
    for (let i = 0; i < 5; i++) {
      const container = document.createElement('div');
      container.id = `cleanup-test-${i}`;
      document.body.appendChild(container);
      
      const widget = document.createElement('countdown-widget');
      widget.setAttribute('config', JSON.stringify({
        targetDate: new Date(Date.now() + 3600000).toISOString(),
        title: `Cleanup Test ${i}`,
        autoRefresh: true
      }));
      container.appendChild(widget);
      widgets.push({ widget, container });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up all widgets
    let cleanupSuccessCount = 0;
    widgets.forEach(({ widget, container }) => {
      try {
        if (typeof widget.destroy === 'function') {
          widget.destroy();
          cleanupSuccessCount++;
        }
        container.remove();
      } catch (e) {
        console.warn('Cleanup failed:', e);
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      widgetsCreated: widgets.length,
      cleanupSuccessCount,
      cleanupEffective: cleanupSuccessCount === widgets.length
    };
  });
  
  expect(cleanupTest.widgetsCreated).toBe(5);
  expect(cleanupTest.cleanupEffective).toBe(true);
});
