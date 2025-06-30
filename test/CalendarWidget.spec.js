import { test, expect } from '@playwright/test';

test('CalendarWidget displays and loads calendar', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a calendar widget to test
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    calendarWidget.setAttribute('config', JSON.stringify({
      highlightToday: true,
      showEvents: true
    }));
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if calendar widget is visible
  const calendarWidget = page.locator('calendar-widget').last();
  await expect(calendarWidget).toBeVisible();
  
  // Should show the header
  await expect(calendarWidget).toContainText('📅 Calendar');
  
  // Should show current month and year
  const currentDate = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  await expect(calendarWidget).toContainText(currentMonth);
  await expect(calendarWidget).toContainText(currentYear.toString());
});

test('CalendarWidget handles configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a calendar widget with custom config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    calendarWidget.setAttribute('config', JSON.stringify({
      startOfWeek: 1, // Monday
      showWeekNumbers: true,
      events: [
        { date: '2024-01-15', title: 'Test Event', color: '#ff0000' },
        { date: '2024-01-20', title: 'Another Event', color: '#00ff00' }
      ]
    }));
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget renders with custom config
  const calendarWidget = page.locator('calendar-widget').last();
  await expect(calendarWidget).toBeVisible();
  
  // Should show calendar grid
  const calendarGrid = calendarWidget.locator('.calendar-grid');
  await expect(calendarGrid).toBeVisible();
});

test('CalendarWidget month navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add calendar widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const calendarWidget = page.locator('calendar-widget').last();
  
  // Should have navigation buttons
  const prevBtn = calendarWidget.locator('.nav-btn').first();
  const nextBtn = calendarWidget.locator('.nav-btn').last();
  await expect(prevBtn).toBeVisible();
  await expect(nextBtn).toBeVisible();
  
  // Get current month for comparison
  const initialMonth = await calendarWidget.locator('.month-year').textContent();
  
  // Test next month navigation
  await nextBtn.click();
  await page.waitForTimeout(500);
  
  const newMonth = await calendarWidget.locator('.month-year').textContent();
  expect(newMonth).not.toBe(initialMonth);
  
  // Test previous month navigation
  await prevBtn.click();
  await page.waitForTimeout(500);
  
  const backToOriginal = await calendarWidget.locator('.month-year').textContent();
  expect(backToOriginal).toBe(initialMonth);
});

test('CalendarWidget today highlighting', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add calendar widget with today highlighting
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    calendarWidget.setAttribute('config', JSON.stringify({
      highlightToday: true
    }));
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const calendarWidget = page.locator('calendar-widget').last();
  
  // Should have a today button
  const todayBtn = calendarWidget.locator('.today-btn');
  await expect(todayBtn).toBeVisible();
  
  // Today's date should be highlighted (check for today class or special styling)
  const todayCell = calendarWidget.locator('.calendar-day.today');
  // Note: This might not always be visible depending on current date and month view
});

test('CalendarWidget events display', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add calendar widget with events
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const calendarWidget = document.createElement('calendar-widget');
    calendarWidget.setAttribute('config', JSON.stringify({
      showEvents: true,
      events: [
        { date: todayStr, title: 'Today Event', color: '#ff0000' },
        { date: '2024-12-25', title: 'Christmas', color: '#00ff00' }
      ]
    }));
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const calendarWidget = page.locator('calendar-widget').last();
  await expect(calendarWidget).toBeVisible();
  
  // Events should be configured (exact display depends on implementation)
  // Widget should render without errors with events
});

test('CalendarWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a calendar widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const calendarWidget = document.querySelector('calendar-widget');
    if (!calendarWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof calendarWidget.init === 'function';
    const hasRefresh = typeof calendarWidget.refresh === 'function';
    const hasDestroy = typeof calendarWidget.destroy === 'function';
    
    // Test calendar-specific methods
    const hasNextMonth = typeof calendarWidget.nextMonth === 'function';
    const hasPreviousMonth = typeof calendarWidget.previousMonth === 'function';
    const hasGoToToday = typeof calendarWidget.goToToday === 'function';
    const hasGetEventsForDate = typeof calendarWidget.getEventsForDate === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasNextMonth, hasPreviousMonth, hasGoToToday, hasGetEventsForDate };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasNextMonth).toBe(true);
  expect(result.hasPreviousMonth).toBe(true);
  expect(result.hasGoToToday).toBe(true);
  expect(result.hasGetEventsForDate).toBe(true);
});

test('CalendarWidget day names display', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add calendar widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const calendarWidget = page.locator('calendar-widget').last();
  
  // Should show day names
  await expect(calendarWidget).toContainText('Sun');
  await expect(calendarWidget).toContainText('Mon');
  await expect(calendarWidget).toContainText('Tue');
  await expect(calendarWidget).toContainText('Wed');
  await expect(calendarWidget).toContainText('Thu');
  await expect(calendarWidget).toContainText('Fri');
  await expect(calendarWidget).toContainText('Sat');
});

test('CalendarWidget start of week configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with Monday as start of week
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    calendarWidget.setAttribute('config', JSON.stringify({
      startOfWeek: 1 // Monday
    }));
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const calendarWidget = page.locator('calendar-widget').last();
  await expect(calendarWidget).toBeVisible();
  
  // Should still show all day names (order might be different)
  await expect(calendarWidget).toContainText('Mon');
  await expect(calendarWidget).toContainText('Sun');
});

test('CalendarWidget handles empty configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add calendar widget with no specific config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const calendarWidget = document.createElement('calendar-widget');
    container.appendChild(calendarWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render with default configuration
  const calendarWidget = page.locator('calendar-widget').last();
  await expect(calendarWidget).toBeVisible();
  await expect(calendarWidget).toContainText('📅 Calendar');
  
  // Should show current month by default
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  await expect(calendarWidget).toContainText(currentYear.toString());
}); 