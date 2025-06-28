# LumaBoard Work Breakdown Structure (WBS)

> **Instructions:** Mark each task as completed by checking the box and updating the verification status. Each task includes a definition of done, verification method, and deliverable(s).

---

## Phase 1: Core Application Framework

- [x] **1.1 Config Loader**
  - **Description:** Implement a module to load, parse, and validate JSON config from file, URL, or localStorage.
  - **Definition of Done:** `src/configLoader.js` exists, loads config, validates against schema, and handles errors.
  - **Verification:** Unit tests in `test/configLoader.spec.js` cover valid, invalid, and missing configs.
  - **Deliverable:** `src/configLoader.js`, `test/configLoader.spec.js`

- [x] **1.2 Scene Engine**
  - **Description:** Implement scene rendering and rotation logic based on config.
  - **Definition of Done:** `src/sceneEngine.js` renders scenes, rotates per schedule, and supports layout.
  - **Verification:** Unit tests in `test/sceneEngine.spec.js` verify scene transitions and layout rendering.
  - **Deliverable:** `src/sceneEngine.js`, `test/sceneEngine.spec.js`

- [x] **1.3 Widget Mounting System**
  - **Description:** Dynamically instantiate and mount widgets as defined in config.
  - **Definition of Done:** `src/widgetMount.js` creates widgets, passes config, and supports positioning.
  - **Verification:** Unit tests in `test/widgetMount.spec.js` verify correct widget instantiation and config passing.
  - **Deliverable:** `src/widgetMount.js`, `test/widgetMount.spec.js`

---

## Phase 2: Widget Development

- [x] **2.1 ClockWidget**
  - **Description:** Implement a real-time clock widget.
  - **Definition of Done:** `src/components/ClockWidget.js` displays current time, updates every second.
  - **Verification:** Unit test in `test/ClockWidget.spec.js` checks time updates.
  - **Deliverable:** `src/components/ClockWidget.js`, `test/ClockWidget.spec.js`

- [x] **2.2 WeatherWidget**
  - **Description:** Fetch and display weather from API, support offline/cached data.
  - **Definition of Done:** `src/components/WeatherWidget.js` fetches weather, displays, and caches data.
  - **Verification:** Unit test in `test/WeatherWidget.spec.js` with mocked API and offline mode.
  - **Deliverable:** `src/components/WeatherWidget.js`, `test/WeatherWidget.spec.js`

- [x] **2.3 NewsTickerWidget**
  - **Description:** Fetch and display news headlines from RSS, auto-scrolls, refreshes.
  - **Definition of Done:** `src/components/NewsTickerWidget.js` parses RSS, displays headlines, refreshes.
  - **Verification:** Unit test in `test/NewsTickerWidget.spec.js` with mocked RSS feed.
  - **Deliverable:** `src/components/NewsTickerWidget.js`, `test/NewsTickerWidget.spec.js`

- [x] **2.4 StockTickerWidget**
  - **Description:** Fetch and display stock data, support fallback/cached data.
  - **Definition of Done:** `src/components/StockTickerWidget.js` fetches stocks, displays, caches data.
  - **Verification:** Unit test in `test/StockTickerWidget.spec.js` with mocked API and offline mode.
  - **Deliverable:** `src/components/StockTickerWidget.js`, `test/StockTickerWidget.spec.js`

- [x] **2.5 YouTubeEmbedWidget**
  - **Description:** Embed and display YouTube videos.
  - **Definition of Done:** `src/components/YouTubeEmbedWidget.js` renders YouTube iframe from config.
  - **Verification:** Unit test in `test/YouTubeEmbedWidget.spec.js` verifies correct embed.
  - **Deliverable:** `src/components/YouTubeEmbedWidget.js`, `test/YouTubeEmbedWidget.spec.js`

- [x] **2.6 ImageSlideshowWidget** (Note: Implemented instead of WebPageEmbedWidget)
  - **Description:** Display images from local/network sources, support slideshow.
  - **Definition of Done:** `src/components/ImageSlideshowWidget.js` cycles images per config.
  - **Verification:** Unit test in `test/ImageSlideshowWidget.spec.js` verifies image cycling.
  - **Deliverable:** `src/components/ImageSlideshowWidget.js`, `test/ImageSlideshowWidget.spec.js`

- [x] **2.7 VideoPlayerWidget**
  - **Description:** Play local/network/YouTube videos.
  - **Definition of Done:** `src/components/VideoPlayerWidget.js` plays video from config.
  - **Verification:** Unit test in `test/VideoPlayerWidget.spec.js` verifies playback.
  - **Deliverable:** `src/components/VideoPlayerWidget.js`, `test/VideoPlayerWidget.spec.js`

- [x] **2.8 CalendarWidget** (Note: Implemented instead of NotesQuotesTodosWidget)
  - **Description:** Display calendar with events and navigation.
  - **Definition of Done:** `src/components/CalendarWidget.js` displays calendar with events.
  - **Verification:** Unit test in `test/CalendarWidget.spec.js` verifies calendar display and navigation.
  - **Deliverable:** `src/components/CalendarWidget.js`, `test/CalendarWidget.spec.js`

- [x] **2.9 CountdownWidget** (Note: Additional widget implemented)
  - **Description:** Display countdown timers to target dates.
  - **Definition of Done:** `src/components/CountdownWidget.js` displays countdown timers.
  - **Verification:** Unit test in `test/CountdownWidget.spec.js` verifies countdown functionality.
  - **Deliverable:** `src/components/CountdownWidget.js`, `test/CountdownWidget.spec.js`

- [x] **2.10 QRCodeWidget** (Note: Additional widget implemented)
  - **Description:** Generate and display QR codes for various data types.
  - **Definition of Done:** `src/components/QRCodeWidget.js` generates QR codes.
  - **Verification:** Unit test in `test/QRCodeWidget.spec.js` verifies QR code generation.
  - **Deliverable:** `src/components/QRCodeWidget.js`, `test/QRCodeWidget.spec.js`

- [x] **2.11 MapWidget** (Note: Additional widget implemented)
  - **Description:** Display maps with markers and geolocation support.
  - **Definition of Done:** `src/components/MapWidget.js` displays interactive maps.
  - **Verification:** Unit test in `test/MapWidget.spec.js` verifies map functionality.
  - **Deliverable:** `src/components/MapWidget.js`, `test/MapWidget.spec.js`

---

## Phase 3: Advanced Features & System Behaviors

- [ ] **3.1 Scene Scheduling & Transitions**
  - **Description:** Implement time/event/manual-based scene changes and transitions (fade, slide).
  - **Definition of Done:** `src/sceneEngine.js` supports scheduling and transitions.
  - **Verification:** Unit/integration tests in `test/sceneEngine.spec.js` for all transition types.
  - **Deliverable:** `src/sceneEngine.js`, `test/sceneEngine.spec.js`

- [ ] **3.2 Config Import/Export UI**
  - **Description:** UI for importing/exporting JSON config (file and URL).
  - **Definition of Done:** UI in `src/components/ConfigImportExport.js` with working import/export.
  - **Verification:** Manual and unit test in `test/ConfigImportExport.spec.js`.
  - **Deliverable:** `src/components/ConfigImportExport.js`, `test/ConfigImportExport.spec.js`

- [ ] **3.3 Offline Fallback**
  - **Description:** Cache config/media, show fallback scene if offline.
  - **Definition of Done:** Offline support in `src/offline.js`, fallback scene in config.
  - **Verification:** Unit test in `test/offline.spec.js` simulates offline mode.
  - **Deliverable:** `src/offline.js`, `test/offline.spec.js`

- [ ] **3.4 Freshness Indicators**
  - **Description:** Visual cues for stale data in widgets.
  - **Definition of Done:** Widgets show freshness indicator if data is stale.
  - **Verification:** Unit tests in each widget's spec file.
  - **Deliverable:** Widget files, updated tests

- [ ] **3.5 Declarative Animation**
  - **Description:** Support widget/scene animations via config.
  - **Definition of Done:** Animation logic in `src/animation.js`, config-driven.
  - **Verification:** Unit test in `test/animation.spec.js` verifies animation triggers.
  - **Deliverable:** `src/animation.js`, `test/animation.spec.js`

- [ ] **3.6 Anti-burn-in & Dimming**
  - **Description:** Implement dimming, jitter, and sleep schedule.
  - **Definition of Done:** Logic in `src/antiBurnIn.js`, config-driven.
  - **Verification:** Unit test in `test/antiBurnIn.spec.js` verifies dimming/jitter.
  - **Deliverable:** `src/antiBurnIn.js`, `test/antiBurnIn.spec.js`

- [ ] **3.7 Debug Overlay & Hidden Settings**
  - **Description:** Overlay for diagnostics, accessible via hover or key combo.
  - **Definition of Done:** `src/components/DebugOverlay.js` displays diagnostics.
  - **Verification:** Unit test in `test/DebugOverlay.spec.js` verifies overlay triggers.
  - **Deliverable:** `src/components/DebugOverlay.js`, `test/DebugOverlay.spec.js`

---

## Phase 4: Theming, Layout, and Customization

- [ ] **4.1 Theme Engine**
  - **Description:** Apply fonts, colors, and styles from config.
  - **Definition of Done:** `src/theme.js` applies theme to app.
  - **Verification:** Unit test in `test/theme.spec.js` verifies theme application.
  - **Deliverable:** `src/theme.js`, `test/theme.spec.js`

- [ ] **4.2 Layout DSL**
  - **Description:** Support grid, flex, and custom layouts from config.
  - **Definition of Done:** Layout logic in `src/layout.js`, config-driven.
  - **Verification:** Unit test in `test/layout.spec.js` verifies layout rendering.
  - **Deliverable:** `src/layout.js`, `test/layout.spec.js`

- [ ] **4.3 Custom CSS/Overrides**
  - **Description:** Allow user-supplied CSS in config (with sanitization).
  - **Definition of Done:** CSS injection logic in `src/customCss.js`, sanitization in place.
  - **Verification:** Unit test in `test/customCss.spec.js` verifies safe CSS injection.
  - **Deliverable:** `src/customCss.js`, `test/customCss.spec.js`

---

## Phase 5: Security, Privacy, and Resilience

- [ ] **5.1 Content Security Policy (CSP)**
  - **Description:** Set/document strict CSP headers for static hosting.
  - **Definition of Done:** CSP documented in `README.md` and/or `public/_headers`.
  - **Verification:** Manual check and browser dev tools.
  - **Deliverable:** `README.md`, `public/_headers`

- [ ] **5.2 Widget Isolation (Shadow DOM)**
  - **Description:** All widgets use Shadow DOM for isolation.
  - **Definition of Done:** All widget files updated to use Shadow DOM.
  - **Verification:** Unit test in each widget's spec file.
  - **Deliverable:** Widget files, updated tests

- [ ] **5.3 Sanitization**
  - **Description:** Sanitize all user-supplied HTML/CSS.
  - **Definition of Done:** Sanitization logic in `src/sanitize.js`.
  - **Verification:** Unit test in `test/sanitize.spec.js` with malicious input.
  - **Deliverable:** `src/sanitize.js`, `test/sanitize.spec.js`

- [ ] **5.4 Password Protection (Optional)**
  - **Description:** Hash-based route for kiosk mode.
  - **Definition of Done:** Password logic in `src/password.js`.
  - **Verification:** Unit test in `test/password.spec.js`.
  - **Deliverable:** `src/password.js`, `test/password.spec.js`

- [ ] **5.5 Resilience Playbook**
  - **Description:** Handle API failures, config errors, and edge cases gracefully.
  - **Definition of Done:** Error handling in all modules, documented in `doc/ResiliencePlaybook.md`.
  - **Verification:** Unit/integration tests for error cases.
  - **Deliverable:** Updated modules, `doc/ResiliencePlaybook.md`

---

## Phase 6: Automated Testing & Acceptance Criteria

- [ ] **6.1 Unit Test Coverage**
  - **Description:** Achieve 100% unit test coverage for all core logic, widgets, and behaviors.
  - **Definition of Done:** All files have corresponding `test/*.spec.js` with full coverage.
  - **Verification:** Coverage report from test runner.
  - **Deliverable:** All `test/*.spec.js` files, coverage report

- [ ] **6.2 Integration & E2E Tests**
  - **Description:** End-to-end tests using Playwright for all user stories and scenarios.
  - **Definition of Done:** `test/e2e/` contains Playwright scripts for all major flows.
  - **Verification:** All E2E tests pass in CI.
  - **Deliverable:** `test/e2e/*.spec.js`

- [ ] **6.3 Test Matrix**
  - **Description:** Maintain a CSV/JSON test matrix mapping features to test cases and expected results.
  - **Definition of Done:** `test/test-matrix.csv` or `.json` is up to date.
  - **Verification:** Manual review, referenced in CI.
  - **Deliverable:** `test/test-matrix.csv` or `.json`

- [ ] **6.4 Browser Validation**
  - **Description:** Test on all major browsers (Chrome, Firefox, Edge, Safari).
  - **Definition of Done:** Manual and automated browser tests completed.
  - **Verification:** Test results documented in `test/browser-validation.md`.
  - **Deliverable:** `test/browser-validation.md`

---

## Phase 7: Documentation & Production Readiness

- [ ] **7.1 User Documentation**
  - **Description:** Update `README.md` with full usage, configuration, and deployment instructions.
  - **Definition of Done:** `README.md` is comprehensive and up to date.
  - **Verification:** Manual review.
  - **Deliverable:** `README.md`

- [ ] **7.2 Developer Documentation**
  - **Description:** Document architecture, widget contracts, and extension points.
  - **Definition of Done:** `doc/DeveloperGuide.md` exists and is complete.
  - **Verification:** Manual review.
  - **Deliverable:** `doc/DeveloperGuide.md`

- [ ] **7.3 Example Configurations**
  - **Description:** Provide multiple example configs for different use cases.
  - **Definition of Done:** `config/` contains at least 3 example configs.
  - **Verification:** Manual review, load in app.
  - **Deliverable:** `config/*.json`

- [ ] **7.4 Production Build**
  - **Description:** Optimize assets, minify, and test production build.
  - **Definition of Done:** Production build in `dist/` is tested and works.
  - **Verification:** Manual and automated test of `dist/` output.
  - **Deliverable:** `dist/` directory

- [ ] **7.5 Release & Versioning**
  - **Description:** Tag release, update version, and changelog.
  - **Definition of Done:** Release tagged in git, `CHANGELOG.md` updated.
  - **Verification:** Manual review.
  - **Deliverable:** Git tag, `CHANGELOG.md`

---

**Legend:**
- [ ] = Not started
- [x] = Done & verified

---

*Update this file as you complete and verify each task!* 