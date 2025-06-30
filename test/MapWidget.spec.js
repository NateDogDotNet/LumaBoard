import { test, expect } from '@playwright/test';

test('MapWidget displays and loads map', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a map widget to test
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 44.9778,
      longitude: -93.2650,
      zoom: 12,
      showMarker: true,
      markerTitle: 'Minneapolis'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if map widget is visible
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show the header
  await expect(mapWidget).toContainText('🗺️ Map');
  
  // Should contain a map container
  const mapContainer = mapWidget.locator('.map-container');
  await expect(mapContainer).toBeVisible();
  
  // Should show coordinates
  await expect(mapWidget).toContainText('44.9778');
  await expect(mapWidget).toContainText('-93.2650');
});

test('MapWidget handles configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject a map widget with custom config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 40.7128,
      longitude: -74.0060,
      zoom: 15,
      mapType: 'satellite',
      showControls: true,
      markerTitle: 'New York City'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget renders with custom config
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show custom coordinates
  await expect(mapWidget).toContainText('40.7128');
  await expect(mapWidget).toContainText('-74.0060');
});

test('MapWidget OpenStreetMap fallback', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with OpenStreetMap enabled
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 51.5074,
      longitude: -0.1278,
      zoom: 10,
      useOpenStreetMap: true,
      showMarker: true,
      markerTitle: 'London'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show OSM tiles or map elements
  const osmMap = mapWidget.locator('.osm-map');
  await expect(osmMap).toBeVisible();
  
  // Should show marker if enabled
  const marker = mapWidget.locator('.marker');
  await expect(marker).toBeVisible();
  await expect(marker).toContainText('📍');
});

test('MapWidget multiple markers', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add map widget with multiple markers
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 12,
      showMarker: true,
      markers: [
        { lat: 37.7849, lng: -122.4094, title: 'Marker 1', description: 'First marker' },
        { lat: 37.7649, lng: -122.4294, title: 'Marker 2', description: 'Second marker' }
      ]
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show San Francisco coordinates
  await expect(mapWidget).toContainText('37.7749');
  await expect(mapWidget).toContainText('-122.4194');
});

test('MapWidget zoom levels', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with different zoom level
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 48.8566,
      longitude: 2.3522,
      zoom: 18, // High zoom level
      showMarker: true,
      markerTitle: 'Paris'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show Paris coordinates
  await expect(mapWidget).toContainText('48.8566');
  await expect(mapWidget).toContainText('2.3522');
});

test('MapWidget controls configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with controls disabled
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 35.6762,
      longitude: 139.6503,
      zoom: 14,
      showControls: false,
      showStreetView: false,
      markerTitle: 'Tokyo'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show Tokyo coordinates
  await expect(mapWidget).toContainText('35.6762');
  await expect(mapWidget).toContainText('139.6503');
});

test('MapWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a map widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const mapWidget = document.querySelector('map-widget');
    if (!mapWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof mapWidget.init === 'function';
    const hasRefresh = typeof mapWidget.refresh === 'function';
    const hasDestroy = typeof mapWidget.destroy === 'function';
    
    // Test map-specific methods
    const hasInitializeMap = typeof mapWidget.initializeMap === 'function';
    const hasUpdateLocation = typeof mapWidget.updateLocation === 'function';
    const hasGetCurrentLocation = typeof mapWidget.getCurrentLocation === 'function';
    const hasInitializeGoogleMaps = typeof mapWidget.initializeGoogleMaps === 'function';
    const hasInitializeOpenStreetMap = typeof mapWidget.initializeOpenStreetMap === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasInitializeMap, hasUpdateLocation, hasGetCurrentLocation, hasInitializeGoogleMaps, hasInitializeOpenStreetMap };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasInitializeMap).toBe(true);
  expect(result.hasUpdateLocation).toBe(true);
  expect(result.hasGetCurrentLocation).toBe(true);
  expect(result.hasInitializeGoogleMaps).toBe(true);
  expect(result.hasInitializeOpenStreetMap).toBe(true);
});

test('MapWidget different map types', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with terrain map type
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 39.8283,
      longitude: -98.5795,
      zoom: 4,
      mapType: 'terrain',
      showMarker: true,
      markerTitle: 'USA Center'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show USA center coordinates
  await expect(mapWidget).toContainText('39.8283');
  await expect(mapWidget).toContainText('-98.5795');
});

test('MapWidget handles empty configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add map widget with no specific config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render with default configuration (Minneapolis)
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  await expect(mapWidget).toContainText('🗺️ Map');
  
  // Should show default Minneapolis coordinates
  await expect(mapWidget).toContainText('44.9778');
  await expect(mapWidget).toContainText('-93.2650');
});

test('MapWidget marker visibility', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with marker disabled
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: -33.8688,
      longitude: 151.2093,
      zoom: 13,
      showMarker: false,
      markerTitle: 'Sydney'
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show Sydney coordinates
  await expect(mapWidget).toContainText('-33.8688');
  await expect(mapWidget).toContainText('151.2093');
  
  // Marker should not be visible (showMarker: false)
  const marker = mapWidget.locator('.marker');
  await expect(marker).not.toBeVisible();
});

test('MapWidget error handling', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with invalid coordinates
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const mapWidget = document.createElement('map-widget');
    mapWidget.setAttribute('config', JSON.stringify({
      latitude: 999, // Invalid latitude
      longitude: 999, // Invalid longitude
      zoom: 10
    }));
    container.appendChild(mapWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render the widget structure
  const mapWidget = page.locator('map-widget').last();
  await expect(mapWidget).toBeVisible();
  
  // Should show the coordinates even if invalid
  await expect(mapWidget).toContainText('999');
}); 