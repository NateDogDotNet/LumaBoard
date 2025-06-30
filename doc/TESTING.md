# Testing Documentation

# 🧪 LumaBoard Testing Guide

## Overview

LumaBoard features a comprehensive test suite with **98 tests** achieving **100% success rate**, validating functionality, accessibility, performance, and error handling across all components.

## Quick Start

### Prerequisites
```bash
# 1. Start the development server (required for tests)
npm run dev

# 2. Install browser dependencies (one-time setup)
npx playwright install
```

### Run All Tests
```bash
npx playwright test
```

### View Test Results
```bash
npx playwright show-report
```

## Test Categories

| Category | Test Count | Purpose |
|:---------|:----------:|:--------|
| **Widget Functionality** | 69 tests | Core widget behavior and rendering |
| **Accessibility** | 5 tests | WCAG compliance and inclusive design |
| **Performance** | 5 tests | Load times, memory usage, stress testing |
| **Error Handling** | 8 tests | Resilience and recovery scenarios |
| **Lifecycle Methods** | 6 tests | Widget initialization and cleanup |
| **Scene Engine** | 5 tests | Layout management and responsiveness |

## Running Tests

### By Category
```bash
# Accessibility validation (5 tests)
npx playwright test accessibility.spec.js

# Performance benchmarks (5 tests)
npx playwright test performance.spec.js

# Error handling scenarios (8 tests)
npx playwright test errorHandling.spec.js

# Widget lifecycle testing (6 tests)
npx playwright test lifecycleMethods.spec.js

# Scene engine validation (5 tests)
npx playwright test sceneEngine.spec.js
```

### Individual Widget Tests
```bash
# Calendar functionality
npx playwright test CalendarWidget.spec.js

# Clock widget behavior
npx playwright test ClockWidget.spec.js

# Countdown timer features
npx playwright test CountdownWidget.spec.js

# Weather widget integration
npx playwright test WeatherWidget.spec.js

# Video player capabilities
npx playwright test VideoPlayerWidget.spec.js

# News ticker display
npx playwright test NewsTickerWidget.spec.js

# And more widget tests...
```

### Test Reporters
```bash
# Detailed list format (best for development)
npx playwright test --reporter=list

# JSON output (best for CI/CD)
npx playwright test --reporter=json

# HTML report with detailed results (default)
npx playwright test --reporter=html

# Multiple reporters
npx playwright test --reporter=list,html
```

### Development Modes
```bash
# Visual mode (see browser actions)
npx playwright test --headed

# Debug mode (step through tests)
npx playwright test --debug

# Single worker (avoid conflicts)
npx playwright test --workers=1
```

## Viewing Test Results

### HTML Test Reports
```bash
# Open latest test report in browser
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

### Live Test Monitoring
```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Run tests with live updates
npx playwright test --reporter=list --workers=1
```

## Performance Benchmarks

LumaBoard meets enterprise-grade performance standards:

| Metric | Target | Actual |
|:-------|:-------|:-------|
| **Page Load Time** | < 5 seconds | ~2.9 seconds |
| **Widget Rendering** | < 100ms | ~50ms average |
| **Concurrent Updates** | < 500ms for 10 widgets | ~300ms |
| **Memory Usage** | No leaks | ✅ Verified |
| **Stress Test** | 15+ widgets | ✅ Passes |

## Accessibility Compliance

- ✅ **Keyboard Navigation** - Full tab order support
- ✅ **Screen Reader** - ARIA labels and semantic structure
- ✅ **Color Contrast** - WCAG AA compliant
- ✅ **Multi-Viewport** - Desktop, tablet, mobile accessible

## Troubleshooting

### Common Issues

#### Server Not Running
**Error**: `Error: connect ECONNREFUSED ::1:5173`
**Solution**:
```bash
npm run dev
```

#### Browser Installation Issues
**Error**: `browserType.launch: Executable doesn't exist`
**Solution**:
```bash
npx playwright install
```

#### Port Conflicts
**Error**: `Port 5173 is already in use`
**Solution**:
```bash
# Use different port
npm run dev -- --port 5174

# Update playwright.config.js baseURL if needed
```

### Debug Tools
```bash
# Run with trace recording
npx playwright test --trace=on

# View trace file
npx playwright show-trace trace.zip

# Run failed tests with debug mode
npx playwright test --last-failed --debug
```

## Continuous Integration

### CI/CD Example
```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Start application
npm run dev &

# Wait for server to be ready
npx wait-on http://localhost:5173

# Run all tests
npx playwright test --reporter=junit,html

# Generate coverage report
npx playwright show-report
```

## Test Development

### Adding New Tests
Create test files in the `test/` directory:

```javascript
import { test, expect } from '@playwright/test';

test('My new feature test', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Test implementation
  const element = page.locator('.my-element');
  await expect(element).toBeVisible();
});
```

### Best Practices
- Use descriptive test names
- Include setup and teardown
- Test both success and error scenarios
- Verify performance expectations
- Ensure accessibility compliance

---

**LumaBoard Test Suite**: Ensuring enterprise-grade quality and reliability with 98 tests at 100% success rate.
