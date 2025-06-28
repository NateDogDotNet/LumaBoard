# Digital Signage & Dashboard System – Full Specification

> **Version** 1.4   |   **Date** 28 Jun 2025   |   **Author** Rowan (AI)

---

## Table of Contents

1. Product Vision
2. Technology Stack & Architecture
3. Developer Workflow
4. Full Feature & Widget Specification
5. Widget Capability Matrix
6. Widget Rendering Contracts & External Data Sources
7. Configuration Schema
8. Complete Example Configurations
9. Acceptance Criteria & Test Matrix
10. Privacy & Security Principles
11. UX Wireframe Hints & UI Guidelines
12. Usage Scenarios & Personas
13. Developer Checklist
14. Edge‑Case & Resilience Playbook
15. Feature Mapping by Use Case
16. User Stories
17. LLM-Specific Instructions
18. Hidden Settings & Debug Access
19. Developer Scenarios
20. Widget Sandbox
21. Scene Scheduler DSL
22. Layout DSL
23. Browser Validation Matrix
24. Automated Functional Testing Framework
25. Data Quality & Freshness Indicators
26. Low-Power, Idle & Anti Burn-in Features
27. Declarative Widget Animation Support
28. Development Principles & Practices

---

## 1 · Product Vision

A self-contained, client-side digital signage platform that operates entirely in the browser using Web APIs and optionally WebAssembly. No server-side logic is required. It supports configurable scenes, dynamic data widgets, and use cases spanning:

* Personal dashboards (home/family hub)
* Business KPI monitors
* Restaurant/food truck menus
* Lobby signage

The system supports external media and configuration sources, live data from APIs, scene transitions, and declarative scheduling.

## 2 · Technology Stack & Architecture

* Core: HTML5, CSS3, ES2022 JavaScript
* Rendering: Web Components or lightweight framework (e.g. Lit)
* Data Access: `fetch`, `Cache`, `localStorage`, `IndexedDB`
* Media Support: `<video>`, `<iframe>`, `<img>` for local/network/YouTube
* Optional: WebAssembly modules for performance-intensive rendering
* Configuration: JSON-based schema (import/export capable)
* Optional Build Tools: Vite or Parcel (YAGNI: not required unless needed)

## 3 · Developer Workflow

1. Clone or download base template
2. Use local dev server (e.g. `http-server` or Vite)
3. Edit scenes and widgets using JSON config or GUI
4. Open browser to view changes live
5. Export or import full configs from disk or URL
6. Use debug overlay for diagnostics
7. Run automated tests via Playwright or Puppeteer

## 4 · Full Feature & Widget Specification

**Core Features:**

* Scene rotation
* Scene scheduling
* Layout and sizing system
* Config import/export (local, network)
* No server dependency
* All rendering and behavior client-side

**Widgets:**

* Clock / Calendar
* Weather (Open-Meteo, WeatherAPI)
* News ticker (RSS)
* Stock ticker / Indexes (IEX Cloud, Yahoo Finance, Twelve Data)
* YouTube Embed
* Web page Embed (`<iframe>`)
* Image / Slideshow (local or network)
* Video player
* Local notes / quotes / todos
* Personal data: bank balances (CSV, open finance APIs), smart scales (Fitbit, Withings), calendar (iCal/ICS from Google Calendar)

**System Behaviors:**

* Hidden settings/debug accessible on hover
* Offline fallback
* Freshness indicators
* Declarative animation
* Anti-burn-in dimming, jitter
* Visual dimming + sleep schedule

## 5 · Widget Capability Matrix

| Widget         | Offline | Cached | Refresh         | External Sources              |
| -------------- | ------- | ------ | --------------- | ----------------------------- |
| Clock          | ✅       | –      | ⏱ Every sec     | –                             |
| Weather        | ✅       | ✅      | ⏱ 5–30 min      | Open-Meteo, WeatherAPI        |
| News Ticker    | ✅       | ✅      | ⏱ 15 min        | RSS (NPR, BBC, etc.)          |
| Stock Ticker   | ✅       | ✅      | ⏱ 1–5 min       | IEX Cloud, Yahoo, Twelve Data |
| Embed          | ✅       | –      | N/A             | Any URL                       |
| Image Viewer   | ✅       | ✅      | ⏱ On Scene Load | HTTP/HTTPS, local             |
| Video Player   | ✅       | ✅      | N/A             | YouTube, MP4                  |
| Notes / Quotes | ✅       | ✅      | ⏱ Hourly        | Local or URL                  |
| Personal Data  | ✅       | ✅      | ⏱ Configured    | Google, Fitbit, CSV, etc.     |

## 6 · Widget Rendering Contracts & External Data Sources

Each widget conforms to a rendering contract:

* `init(config)`: Load config
* `render(container)`: Create/update DOM nodes
* `refresh(data)`: Update UI from new data
* `destroy()`: Cleanup DOM/state

| Widget        | Data Source(s)                                 |
| ------------- | ---------------------------------------------- |
| Weather       | Open-Meteo, WeatherAPI, Tomorrow\.io           |
| News Ticker   | Any public RSS feed                            |
| Stock Ticker  | IEX Cloud, Yahoo Finance, Alpha Vantage        |
| Calendar      | Google Calendar (ICS), Outlook Web ICS URLs    |
| Personal Data | Fitbit API, Withings API, CSV import, YNAB API |

## 7 · Configuration Schema

* Entire display is defined by a JSON configuration
* Top-level structure:

```json
{
  "scenes": [ ... ],
  "theme": { ... },
  "schedule": { ... },
  "data": { ... },
  "meta": { "version": "1.0" }
}
```

* Each `scene` has `layout`, `widgets`, `duration`, `transitions`
* Each `widget` has type, id, position, and config block

## 8 · Complete Example Configurations

**Basic Example:**

```json
{
  "scenes": [
    {
      "name": "Welcome",
      "duration": 15,
      "layout": "grid-2x2",
      "widgets": [
        { "type": "clock", "id": "clock-1" },
        { "type": "weather", "config": { "location": "Minneapolis" } }
      ]
    }
  ],
  "theme": { "font": "Inter", "color": "#333" },
  "schedule": { "default": ["Welcome"] }
}
```

## 9 · Acceptance Criteria & Test Matrix

* Widgets render correctly and update on time
* Scene transitions obey schedule
* Config loads from disk and network
* Offline use with fallback config/media
* Hidden menu appears only on hover
* Test Matrix maintained in CSV or JSON for automation:

```csv
Feature,Test Case,Expected Result
Weather Widget,Loads API,Displays forecast
Stock Widget,Fallback on API fail,Shows cached data
Scene Engine,Rotation active,Changes after interval
```

## 10 · Privacy & Security Principles

* No third-party tracking
* No external JavaScript execution from config
* Widget isolation via Shadow DOM
* Sanitization of HTML if user-defined content
* CSP (Content-Security-Policy) headers recommended
* Optional password protection via hash route (if deployed in kiosk)


## 11 · UX Wireframe Hints & UI Guidelines

* **No visible UI chrome** unless hovered over top-right corner
* **Configurable layout grid system** with rows/columns/absolute positioning
* **Responsive rendering** with pixel-scaling and zoom factor
* **Fallback fonts and high-contrast themes** for accessibility
* **Animations and transitions** should avoid excessive motion (respect user system preferences)
* Scene transitions (fade, slide, cut) must be smooth and GPU-accelerated

## 12 · Usage Scenarios & Personas

**Personal / Family Dashboard:**

* Shows weather, calendar, personal notes, health data
* Passive wall-mounted tablet or smart display

**Business Operations Board:**

* Departmental KPIs, system health, uptime monitors
* Used in devops teams or executive spaces

**Restaurant / Food Truck Menu:**

* Scene rotation between menu, promotions, branding
* Shows pricing, daily deals, social media embeds

**Waiting Room or Lobby Signage:**

* Looping scenes with welcome messages, schedule, maps

## 13 · Developer Checklist

* [ ] No external scripts beyond fetchable data
* [ ] Works offline after first load
* [ ] Clear widget error states (fallbacks)
* [ ] Loads configs from disk and URL
* [ ] Fully modular widget system
* [ ] Animations respect user motion preferences
* [ ] Build includes documentation and tests

## 14 · Edge‑Case & Resilience Playbook

* **API Failure** → use cached data or placeholder
* **Offline Mode** → auto-detect and display offline badge
* **Expired Configs** → notify or fall back to default scene
* **Resolution Change** → recalculate layout dynamically
* **Out-of-Sync Clocks** → show time drift warning if applicable

## 15 · Feature Mapping by Use Case

| Feature                  | Home | Business | Restaurant | Lobby |
| ------------------------ | ---- | -------- | ---------- | ----- |
| Weather Widget           | ✅    | ✅        | ✅          | ✅     |
| Calendar Widget          | ✅    | ✅        | ⬜          | ✅     |
| Stock Ticker             | ⬜    | ✅        | ⬜          | ⬜     |
| RSS News Feed            | ✅    | ✅        | ✅          | ✅     |
| Scene Scheduler          | ✅    | ✅        | ✅          | ✅     |
| YouTube/Media Embeds     | ✅    | ✅        | ✅          | ✅     |
| Price List / Menu Scenes | ⬜    | ⬜        | ✅          | ⬜     |
| Fitness/Health Widgets   | ✅    | ⬜        | ⬜          | ⬜     |
| Metrics/Custom KPIs      | ⬜    | ✅        | ⬜          | ✅     |
| Offline Resilience       | ✅    | ✅        | ✅          | ✅     |


## 16 · User Stories

**As a restaurant owner**, I want to rotate between my menu and promotions automatically so customers always see the right content at the right time.

**As a home user**, I want to see the weather, my shared family calendar, and recent notes so I can stay informed without having to interact with anything.

**As a DevOps lead**, I want to display KPIs from our system monitors in a clean layout on a TV so my team can respond quickly to incidents.

**As a front desk manager**, I want to show a welcome message, a map, and the current day’s schedule in our office lobby so visitors can self-orient.

**As a logistics supervisor**, I want to see a stock ticker and system uptime indicators next to the shift schedule so I can correlate activity with operations.

## 17 · LLM-Specific Instructions

If using an AI agent to develop this project:

* Adhere strictly to the documented feature set
* Use only client-side technologies (no server execution)
* Favor declarative configuration patterns
* Apply YAGNI and KISS principles before “best practices”
* Widgets should use standard fetch for APIs and localStorage/IndexedDB for state
* Configuration and layout should be JSON-based and parseable without custom runtime

## 18 · Hidden Settings & Debug Access

* UI for settings and debug only appears if mouse is hovered over the top-right corner for 2 seconds
* Settings include:

  * Change config URL
  * Adjust scene duration
  * Manually reorder scenes
  * Export/import config
  * Clear local storage cache
* Debug overlay includes:

  * Frame rate
  * Widget load errors
  * Network request status
  * Time to render

## 19 · Developer Scenarios

* **Load time tests** with slow network throttling
* **Device testing** on iPad, Raspberry Pi touchscreen, and ChromeOS
* **Data error handling** (404, 500, malformed JSON)
* **Media fallback testing** (missing image, offline video)
* **Widget conflict testing** (multiple instances of same widget)

## 20 · Widget Sandbox

* A special local-only scene with no rotation
* Allows direct live editing of widget configurations
* Changes can be saved to localStorage or exported
* Sandbox mode is triggered by adding `?sandbox=true` to the URL
* Layout includes 4 flexible regions:

  * Clock
  * 2–3 widgets from config
  * Real-time data editor panel
  * Render result viewer


## 21 · Scene Scheduler DSL

A minimal, JSON-based domain-specific language for controlling the timing and ordering of scenes.

```json
{
  "schedule": [
    { "scene": "welcome", "duration": 10 },
    { "scene": "weather", "duration": 15 },
    { "scene": "kpi", "duration": 20 },
    { "scene": "menu", "duration": 12 }
  ]
}
```

* All durations are in seconds
* Schedule loops by default unless `repeat: false` is set

## 22 · Layout DSL

Defines widget positions using grid-based layout in JSON.

```json
{
  "layout": {
    "type": "grid",
    "rows": 2,
    "columns": 2,
    "widgets": [
      { "id": "clock", "row": 0, "col": 0 },
      { "id": "weather", "row": 0, "col": 1 },
      { "id": "calendar", "row": 1, "col": 0, "colSpan": 2 }
    ]
  }
}
```

* Supports row/col span
* Future expansion may include flexbox or absolute coordinates

## 23 · Browser Validation Matrix

| Feature         | Chrome | Firefox | Safari | Edge | Chromium (Kiosk) |
| --------------- | ------ | ------- | ------ | ---- | ---------------- |
| Widgets Render  | ✅      | ✅       | ✅      | ✅    | ✅                |
| Local Config    | ✅      | ✅       | ✅      | ✅    | ✅                |
| Offline Cache   | ✅      | ✅       | ✅      | ✅    | ✅                |
| Fullscreen Mode | ✅      | ✅       | ✅      | ✅    | ✅                |
| WASM Support    | ✅      | ✅       | ✅      | ✅    | ✅                |

## 24 · Automated Functional Testing Framework

* **Tools:** Playwright (preferred), Puppeteer (fallback)
* **Test Coverage:**

  * Widget rendering validation
  * API fallback and cache logic
  * Scene scheduling accuracy
  * Layout boundary testing (overflow, wrapping)
  * UI trigger (settings/debug access)

**Sample test (Playwright):**

```ts
import { test, expect } from '@playwright/test';

test('weather widget loads data', async ({ page }) => {
  await page.goto('http://localhost:8080');
  const widget = page.locator('#widget-weather');
  await expect(widget).toContainText('°');
});
```

## 25 · Data Quality & Freshness Indicators

* All data widgets include a `lastUpdated` timestamp in their footer or title bar
* If data is older than a set threshold (per widget config), a warning icon appears
* Cached data sources show "(cached)" in gray text
* If the source has failed multiple times, an error badge is shown in red


## 26 · Low-Power, Idle & Anti Burn-in Features

* **Scene Shifting**: Slight pixel-offset shifts every few minutes to avoid static UI burn-in
* **Auto-Dimming**: Dims screen after set idle threshold
* **Blackout Mode**: Turns screen black between low-importance scenes (configurable)
* **Time-Based Brightness**: Configurable brightness curve tied to time of day (e.g., darker at night)
* **Sleep Schedule**: Option to disable display entirely during off hours

## 27 · Declarative Widget Animation Support

Each widget supports lightweight, declarative animation parameters via config:

```json
{
  "animation": {
    "type": "fade",
    "duration": 0.5,
    "delay": 0.2,
    "repeat": false
  }
}
```

* **Type**: `fade`, `slide-left`, `slide-right`, `zoom`, `grow`, `pulse`
* **Duration**: in seconds
* **Delay**: optional initial delay
* **Repeat**: whether animation loops (defaults to false)
* All animations honor reduced-motion OS settings if present

## 28 · Development Principles & Practices

* **YAGNI (You Aren’t Gonna Need It)**

  * No speculative features or abstractions
  * Only implement what's explicitly needed in this spec
* **KISS (Keep It Simple, Stupid)**

  * Avoid complex patterns when a simpler option exists
  * Flat, functional components preferred over inheritance
* **Best Practices (Only When Justified)**

  * Use linting (ESLint) and formatting (Prettier)
  * Write unit and integration tests (Vitest or Playwright)
  * Comment public interfaces only; no doc-block clutter
  * Avoid excessive generalization or meta-programming
* **Code Quality Guidance**

  * Prefer explicit over clever
  * Embrace declarative patterns where possible
  * Separate layout logic from data handling
* **Accessibility Requirements**

  * All widgets must have semantic roles and ARIA labels
  * Respect user OS settings for dark mode, reduced motion, and contrast
