import { test, expect } from '@playwright/test';

test('QRCodeWidget displays and generates QR code', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create QR code widget with test config
  await page.evaluate(() => {
    const config = {
      data: 'https://example.com',
      size: 200,
      title: 'Test QR Code',
      dataType: 'url'
    };

    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check if QR widget is visible
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show the header with URL icon (🌐 for URL type, not 📱)
  await expect(qrWidget).toContainText('🌐 Test QR Code');
  
  // Should contain a canvas for the QR code
  const canvas = qrWidget.locator('canvas');
  await expect(canvas).toBeVisible();
  
  // Should show the data being encoded
  await expect(qrWidget).toContainText('https://example.com');
});

test('QRCodeWidget handles different data types', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with email data type
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify({
      data: 'test@example.com',
      dataType: 'email',
      title: 'Email QR Code'
    }));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Check that the widget renders with email config
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show email icon
  await expect(qrWidget).toContainText('📧');
  
  // Should show email data
  await expect(qrWidget).toContainText('test@example.com');
});

test('QRCodeWidget phone data type', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with phone data type
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify({
      data: '+1-555-123-4567',
      dataType: 'phone',
      title: 'Phone QR Code'
    }));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show phone icon
  await expect(qrWidget).toContainText('📞');
  
  // Should show phone data
  await expect(qrWidget).toContainText('+1-555-123-4567');
});

test('QRCodeWidget WiFi data type', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with WiFi data type
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify({
      data: 'WIFI:T:WPA;S:MyNetwork;P:password123;;',
      dataType: 'wifi',
      title: 'WiFi QR Code'
    }));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show WiFi icon
  await expect(qrWidget).toContainText('📶');
  
  // Should show WiFi Network text
  await expect(qrWidget).toContainText('WiFi Network');
});

test('QRCodeWidget customization options', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with custom colors and size
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify({
      data: 'Custom QR Code',
      size: 150,
      foregroundColor: '#FF0000',
      backgroundColor: '#FFFFFF',
      errorCorrectionLevel: 'H',
      showTitle: true,
      showData: true
    }));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show the data
  await expect(qrWidget).toContainText('Custom QR Code');
  
  // Canvas should have the specified size
  const canvas = qrWidget.locator('canvas');
  const canvasWidth = await canvas.getAttribute('width');
  expect(canvasWidth).toBe('150');
});

test('QRCodeWidget text data type', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Create QR code widget with text data
  await page.evaluate(() => {
    const config = {
      data: 'Hello World',
      title: 'Text QR',
      dataType: 'text'
    };

    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '250px';
    document.body.appendChild(container);

    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify(config));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show text icon (📝 for text type)
  await expect(qrWidget).toContainText('📝 Text QR');
});

test('QRCodeWidget lifecycle methods', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a QR code widget
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(500);
  
  // Test that widget methods exist and can be called
  const result = await page.evaluate(() => {
    const qrWidget = document.querySelector('qrcode-widget');
    if (!qrWidget) return false;
    
    // Test widget contract methods
    const hasInit = typeof qrWidget.init === 'function';
    const hasRefresh = typeof qrWidget.refresh === 'function';
    const hasDestroy = typeof qrWidget.destroy === 'function';
    
    // Test QR code-specific methods
    const hasGenerateQRCode = typeof qrWidget.generateQRCode === 'function';
    const hasRegenerateQRCode = typeof qrWidget.regenerateQRCode === 'function';
    const hasDownloadQRCode = typeof qrWidget.downloadQRCode === 'function';
    const hasFormatDataForDisplay = typeof qrWidget.formatDataForDisplay === 'function';
    const hasGetDataTypeIcon = typeof qrWidget.getDataTypeIcon === 'function';
    
    return { hasInit, hasRefresh, hasDestroy, hasGenerateQRCode, hasRegenerateQRCode, hasDownloadQRCode, hasFormatDataForDisplay, hasGetDataTypeIcon };
  });
  
  expect(result.hasInit).toBe(true);
  expect(result.hasRefresh).toBe(true);
  expect(result.hasDestroy).toBe(true);
  expect(result.hasGenerateQRCode).toBe(true);
  expect(result.hasRegenerateQRCode).toBe(true);
  expect(result.hasDownloadQRCode).toBe(true);
  expect(result.hasFormatDataForDisplay).toBe(true);
  expect(result.hasGetDataTypeIcon).toBe(true);
});

test('QRCodeWidget handles empty configuration', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add QR code widget with no specific config
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  // Should still render with default configuration
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  await expect(qrWidget).toContainText('🌐 QR Code');
  
  // Should show default URL
  await expect(qrWidget).toContainText('example.com');
  
  // Should have canvas
  const canvas = qrWidget.locator('canvas');
  await expect(canvas).toBeVisible();
});

test('QRCodeWidget error correction levels', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with high error correction
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify({
      data: 'Error correction test',
      errorCorrectionLevel: 'H', // High error correction
      title: 'High Error Correction'
    }));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should render without errors
  await expect(qrWidget).toContainText('High Error Correction');
  
  // Canvas should be present
  const canvas = qrWidget.locator('canvas');
  await expect(canvas).toBeVisible();
});

test('QRCodeWidget SMS data type', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test with SMS data type
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    const qrWidget = document.createElement('qrcode-widget');
    qrWidget.setAttribute('config', JSON.stringify({
      data: 'SMSTO:+1234567890:Hello World',
      dataType: 'sms',
      title: 'SMS QR Code'
    }));
    container.appendChild(qrWidget);
  });
  
  // Wait for widget to render
  await page.waitForTimeout(1000);
  
  const qrWidget = page.locator('qrcode-widget').last();
  await expect(qrWidget).toBeVisible();
  
  // Should show SMS icon
  await expect(qrWidget).toContainText('💬');
  
  // Should show SMS text
  await expect(qrWidget).toContainText('SMS');
}); 