# LumaBoard

A self-contained, client-side digital signage and dashboard system that runs entirely in the browser. Configure scenes, widgets, and layouts using JSON. No server required.

## Features
- Scene rotation and scheduling
- Dynamic widgets: clock, weather, news, stocks, YouTube, images, video, notes, and more
- Offline fallback and data caching
- Visual dimming, anti-burn-in, and sleep scheduling
- Debug overlay and developer tools

## Getting Started
1. Clone the repo
2. Run a local dev server (e.g., Vite, http-server)
3. Edit `config/example-config.json` to customize scenes and widgets
4. Open `index.html` in your browser

## Security

LumaBoard implements comprehensive security measures for production deployment:

### Content Security Policy (CSP)
The application uses strict CSP headers to prevent XSS attacks and unauthorized content loading. The CSP policy includes:

- **default-src 'self'**: Only allow resources from the same origin
- **script-src 'self' 'unsafe-inline'**: Allow inline scripts for dynamic content
- **style-src 'self' 'unsafe-inline' fonts.googleapis.com**: Allow styles and Google Fonts
- **img-src 'self' data: https: blob**: Allow images from secure sources
- **frame-src 'self' https://www.youtube.com**: Allow YouTube embeds
- **connect-src 'self' https: wss**: Allow secure network connections

### Deployment Security Headers
For production deployment, ensure your hosting platform supports the security headers defined in `public/_headers`:

**Netlify/Vercel**: Headers are automatically applied from `public/_headers`
**Apache**: Copy directives to `.htaccess`
**Nginx**: Add headers to server configuration
**Cloudflare**: Configure security headers in dashboard

### Input Sanitization
All user inputs are automatically sanitized using the built-in sanitization engine:
- HTML content is filtered through allowlist-based sanitization
- CSS properties are validated against security policies
- URLs are validated for protocol and domain restrictions
- Configuration data is validated against schemas

### Browser Compatibility
- Modern browsers with CSP Level 2 support
- Shadow DOM support for widget isolation
- ES2022 features (optional chaining, nullish coalescing)

## Tech Stack
- HTML5, CSS3, ES2022 JavaScript
- Web Components with Shadow DOM isolation
- Content Security Policy (CSP) Level 2
- Optional: Vite for development

## License
MIT 

## 🧪 Testing

LumaBoard includes a comprehensive test suite with **98 tests** achieving **100% success rate**, covering functionality, accessibility, performance, and error handling.

### Running Tests

#### Run All Tests
```bash
npx playwright test
```

#### Run Specific Test Categories
```bash
# Accessibility tests (5 tests)
npx playwright test accessibility.spec.js

# Performance tests (5 tests)
npx playwright test performance.spec.js

# Error handling tests (8 tests)
npx playwright test errorHandling.spec.js

# Lifecycle method tests (6 tests)
npx playwright test lifecycleMethods.spec.js

# Scene engine tests (5 tests)
npx playwright test sceneEngine.spec.js

# Individual widget tests
npx playwright test CalendarWidget.spec.js
npx playwright test ClockWidget.spec.js
npx playwright test CountdownWidget.spec.js
npx playwright test WeatherWidget.spec.js
# ... and more widget tests
```

#### Run Tests with Different Reporters
```bash
# Detailed list format
npx playwright test --reporter=list

# JSON output for CI/CD
npx playwright test --reporter=json

# JUnit format for integration
npx playwright test --reporter=junit

# HTML report (default)
npx playwright test --reporter=html
```

#### Run Tests in Different Modes
```bash
# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests on specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Viewing Test Results

#### HTML Test Reports
After running tests, view the comprehensive HTML report:

```bash
# Open the latest test report
npx playwright show-report

# Open report on specific port
npx playwright show-report --port 9324
```

The HTML report provides:
- ✅ **Test Results Overview** - Pass/fail summary with timing
- 📊 **Performance Metrics** - Load times and rendering speed
- 🎯 **Test Details** - Step-by-step execution with screenshots
- 🐛 **Error Analysis** - Detailed failure information with context
- 📈 **Trends** - Historical test performance data

#### Live Test Monitoring
Monitor tests in real-time during development:

```bash
# Run dev server (required for tests)
npm run dev

# In another terminal, run tests with live updates
npx playwright test --reporter=list --workers=1
```

### Test Coverage Areas

| **Test Category** | **Test Count** | **Coverage** |
|:------------------|:--------------:|:-------------|
| **Widget Functionality** | 69 tests | All 15+ widgets validated |
| **Accessibility** | 5 tests | WCAG compliance, keyboard nav |
| **Performance** | 5 tests | Load times, memory, stress |
| **Error Handling** | 8 tests | API failures, invalid data |
| **Lifecycle Methods** | 6 tests | Init, refresh, destroy |
| **Scene Engine** | 5 tests | Layout, mounting, responsive |

### Performance Benchmarks

LumaBoard meets enterprise-grade performance standards:

- ⚡ **Page Load**: < 5 seconds
- 🚀 **Widget Rendering**: < 100ms per widget
- 🔄 **Concurrent Updates**: 10 widgets in < 500ms
- 💾 **Memory Usage**: No leaks detected
- 📱 **Responsive**: All viewports supported

### Accessibility Compliance

- ✅ **Keyboard Navigation** - Full tab order support
- ✅ **Screen Reader** - ARIA labels and semantic structure
- ✅ **Color Contrast** - WCAG AA compliant
- ✅ **Multi-Viewport** - Desktop, tablet, mobile accessible

### Test Development

#### Adding New Tests
Create test files in the `test/` directory:

```javascript
import { test, expect } from '@playwright/test';

test('My new feature test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Your test logic here
  expect(await page.locator('.my-element')).toBeVisible();
});
```

#### Running Tests During Development
```bash
# Start dev server
npm run dev

# Run specific test file during development
npx playwright test myNewFeature.spec.js --headed --workers=1
```

### Continuous Integration

For CI/CD pipelines:

```bash
# Install dependencies
npm ci

# Start application
npm run dev &

# Wait for server to be ready
npx wait-on http://localhost:5173

# Run all tests
npx playwright test --reporter=junit,html

# Generate coverage report
npx playwright show-report
```

### Troubleshooting Tests

#### Common Issues
1. **Server not running**: Ensure `npm run dev` is active
2. **Port conflicts**: Use `--port` flag with different port
3. **Browser issues**: Run `npx playwright install`
4. **Timeout errors**: Increase timeout in `playwright.config.js`

#### Debug Failed Tests
```bash
# Run failed tests with debug mode
npx playwright test --last-failed --debug

# Run with trace for detailed analysis
npx playwright test --trace=on

# View trace files
npx playwright show-trace trace.zip
```

---

## Development

[Rest of README content...] 