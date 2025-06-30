# Quick Reference

# 🧪 LumaBoard Testing - Quick Reference

## 🚀 Getting Started

```bash
# 1. Start development server (required!)
npm run dev

# 2. Install browsers (one-time setup)
npm run test:install

# 3. Run all tests
npm test
```

## 📊 Test Categories (98 tests total - 100% success rate)

| Command | Tests | Purpose |
|:--------|:-----:|:--------|
| `npm test` | 98 | **All tests** |
| `npm run test:accessibility` | 5 | WCAG compliance |
| `npm run test:performance` | 5 | Load times & speed |
| `npm run test:errors` | 8 | Error handling |
| `npm run test:lifecycle` | 6 | Widget lifecycle |
| `npm run test:scene` | 5 | Scene engine |

## 🎯 Individual Widget Tests

```bash
npx playwright test CalendarWidget.spec.js    # Calendar
npx playwright test ClockWidget.spec.js       # Clock
npx playwright test CountdownWidget.spec.js   # Countdown
npx playwright test WeatherWidget.spec.js     # Weather
npx playwright test VideoPlayerWidget.spec.js # Video
npx playwright test NewsTickerWidget.spec.js  # News
npx playwright test StockTickerWidget.spec.js # Stocks
npx playwright test QRCodeWidget.spec.js      # QR codes
npx playwright test MapWidget.spec.js         # Maps
```

## 🔍 Development & Debugging

```bash
npm run test:headed    # See browser actions
npm run test:debug     # Step through tests
npm run test:report    # View HTML report
```

## 📈 View Results

```bash
# Open test report in browser
npm run test:report

# Open on specific port
npx playwright show-report --port 9324
```

## 🔧 Troubleshooting

| Problem | Solution |
|:--------|:---------|
| Server not running | `npm run dev` |
| Browser missing | `npm run test:install` |
| Port conflict | Use `npm run dev -- --port 5174` |
| Test timeout | Add `--timeout=60000` |

## ⚡ Quick Commands

```bash
# Essential commands
npm run dev                    # Start server
npm test                       # Run all tests  
npm run test:report           # View results

# Development
npm run test:headed           # Visual testing
npm run test:debug            # Debug mode
npx playwright test --workers=1  # Single worker

# Specific categories
npm run test:accessibility    # 5 accessibility tests
npm run test:performance      # 5 performance tests
```

## 📋 Performance Benchmarks

✅ **Page Load**: < 5 seconds (actual: ~2.9s)  
✅ **Widget Render**: < 100ms (actual: ~50ms)  
✅ **Concurrent Updates**: < 500ms for 10 widgets  
✅ **Memory**: No leaks detected  
✅ **Stress Test**: 15+ widgets supported  

## 🎯 Accessibility Validated

✅ **Keyboard Navigation**  
✅ **Screen Reader Support**  
✅ **WCAG AA Compliance**  
✅ **Multi-Viewport**  

---

**📚 Full Documentation**: `doc/TESTING.md`  
**🎯 Current Status**: 98/98 tests passing (100% success rate)
