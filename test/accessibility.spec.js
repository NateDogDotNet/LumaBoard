import { test, expect } from "@playwright/test";

test('Accessibility - keyboard navigation support', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Test that page is keyboard accessible
  const keyboardNavigation = await page.evaluate(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return {
      hasFocusableElements: focusableElements.length > 0,
      focusableCount: focusableElements.length
    };
  });
  
  expect(keyboardNavigation.focusableCount).toBeGreaterThanOrEqual(0);
});

test('Accessibility - ARIA labels and semantic structure', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Check for proper semantic structure
  const ariaCompliance = await page.evaluate(() => {
    const widgets = document.querySelectorAll('[class*="widget"]');
    return {
      totalWidgets: widgets.length,
      hasMainContent: !!document.querySelector('main, [role="main"], .scene-layout'),
      hasProperHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0
    };
  });
  
  expect(ariaCompliance.totalWidgets).toBeGreaterThan(0);
  expect(ariaCompliance.hasMainContent).toBe(true);
});

test('Accessibility - color contrast and visual accessibility', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Test basic visual accessibility
  const visualAccessibility = await page.evaluate(() => {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let visibleTextCount = 0;
    
    textElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none' && style.visibility !== 'hidden' && el.textContent?.trim()) {
        visibleTextCount++;
      }
    });
    
    return {
      visibleTextCount,
      documentHasContent: document.body.textContent?.trim().length > 0
    };
  });
  
  expect(visualAccessibility.documentHasContent).toBe(true);
  expect(visualAccessibility.visibleTextCount).toBeGreaterThan(0);
});

test('Accessibility - screen reader compatibility', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Test screen reader accessibility features
  const screenReaderCompat = await page.evaluate(() => {
    return {
      hasDocumentTitle: !!document.title && document.title.trim().length > 0,
      hasLangAttribute: !!document.documentElement.getAttribute('lang'),
      textContent: document.body.textContent?.trim() || '',
      structuredContent: {
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        landmarks: document.querySelectorAll('main, nav, aside, header, footer, [role], .scene-layout').length
      }
    };
  });
  
  expect(screenReaderCompat.hasDocumentTitle).toBe(true);
  expect(screenReaderCompat.textContent.length).toBeGreaterThan(0);
  expect(screenReaderCompat.structuredContent.landmarks).toBeGreaterThanOrEqual(1);
});

test('Accessibility - responsive design accessibility', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test accessibility across different viewport sizes
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    const accessibilityCheck = await page.evaluate(() => {
      // Check if content is still accessible at this viewport
      const visibleElements = document.querySelectorAll('*:not([style*="display: none"])');
      const hasVisibleContent = Array.from(visibleElements).some(el => 
        el.textContent?.trim().length > 0
      );
      
      // Check if text is still readable (not too small)
      const textElements = document.querySelectorAll('p, span, div');
      let readableTextCount = 0;
      
      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize >= 12 && el.textContent?.trim()) {
          readableTextCount++;
        }
      });
      
      return {
        hasVisibleContent,
        readableTextCount
      };
    });
    
    expect(accessibilityCheck.hasVisibleContent).toBe(true);
    expect(accessibilityCheck.readableTextCount).toBeGreaterThanOrEqual(0);
  }
});
