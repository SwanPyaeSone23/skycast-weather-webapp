# Skycast — Live Weather Dashboard

A polished, single-page weather app built with **React 19**, **TypeScript**, **Vite**, and **Framer Motion**. Data comes from the **Visual Crossing Timeline Weather API**.

## Features

| Requirement | Implementation |
|-------------|----------------|
| Search for any location | Autocomplete-free search bar; accepts city names, ZIP codes, coordinates |
| Current temperature, wind, rain chance, conditions | Hero card + 6-item stats grid (wind, precipitation, humidity, UV, pressure, visibility) |
| Previous 24 hours | Horizontally scrollable strip with hour, icon, temperature, rain probability |
| Next 24 hours | Same component, fed by the forecast window |
| Manual refresh | Refresh button in header re-fetches the last requested location |
| **Stretch**: Framer Motion animations | Page-load stagger, card entrance, hourly list stagger, skeleton shimmer, icon loops |
| **Stretch**: Default to user location | On first load (with a valid key) the browser Geolocation API is asked; falls back to last searched city, then an empty state with quick-pick chips |

## Tech Stack

- **React 19.3** + **TypeScript 7** (strict, `verbatimModuleSyntax`)
- **Vite 8** — `base: './'` for GitHub Pages portability
- **Framer Motion 14** — declarative animations, respects `prefers-reduced-motion`
- **Vitest 5** — unit tests (`environment: 'node'`)
- **Playwright** — visual/E2E verification (headed Chrome)
- **Visual Crossing Timeline API** — metric units, hourly + current conditions, ±2-day window

## Quick Start

```bash
# 1. Install dependencies
npm ci

# 2. (Optional) Add a Visual Crossing API key for local development
#    Get a free key at https://www.visualcrossing.com/weather-api
cp .env.example .env
# edit .env and set VITE_VISUAL_CROSSING_API_KEY=your_key_here

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> **No API key?** The UI has a setup gate where you can paste a key; it is saved to `localStorage` (`skycast.apiKey`) and never leaves your browser except for the Visual Crossing request.

## API Key Handling

| Method | Persistence | Use Case |
|--------|-------------|----------|
| In-app entry (Settings → key form) | `localStorage` (`skycast.apiKey`) | Local development, personal use |
| `.env` file (`VITE_VISUAL_CROSSING_API_KEY`) | Build-time constant | CI/CD, GitHub Pages deployments |
| Neither | — | App shows a friendly setup gate |

Placeholder values (`your_visual_crossing_api_key_here`, `paste...`, `replace...`, or anything containing `<`) are ignored.

## Project Structure

```
Weather Web App/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── visualCrossing.ts       # fetchWeather, URL builder, HTTP error mapping
│   │   └── visualCrossing.test.ts
│   ├── components/
│   │   ├── Icon.tsx                # Shared inline SVG icon system
│   │   ├── WeatherIcon.tsx         # Hand-drawn animated weather illustrations
│   │   ├── UnitToggle.tsx          # °C / °F segmented control
│   │   ├── SearchBar.tsx           # Location input + submit
│   │   ├── Header.tsx              # Brand, search, unit toggle, locate, refresh, settings
│   │   ├── CurrentCard.tsx         # Hero: big temp, condition, feels-like, sunrise/sunset
│   │   ├── StatsGrid.tsx           # 6 detail cards
│   │   ├── HourlyStrip.tsx         # Past / future 24 h scrollable lists
│   │   ├── LoadingView.tsx         # Skeleton screens
│   │   ├── EmptyView.tsx           # First-visit state + city chips
│   │   ├── ErrorView.tsx           # Full-screen error with retry
│   │   ├── ErrorBanner.tsx         # Toast-style banner for refresh failures
│   │   ├── ApiKeyGate.tsx          # Setup screen when no key exists
│   │   ├── ApiKeyForm.tsx          # Key input with show/hide + validation
│   │   └── ApiKeyDialog.tsx        # Settings modal (save new / remove)
│   ├── lib/
│   │   ├── types.ts                # Raw VC types + normalized UI types
│   │   ├── errors.ts               # WeatherApiError (kind + status)
│   │   ├── units.ts                # °C/°F, km/h↔mph, hPa↔inHg, mm↔in, compass, UV bands
│   │   ├── format.ts               # Intl time/date in location zone, date keys
│   │   ├── theme.ts                # Icon → kind → Theme (per-condition gradients)
│   │   ├── weather.ts              # buildSnapshot: VC response → WeatherSnapshot
│   │   ├── storage.ts              # localStorage helpers (key, unit, last location)
│   │   ├── geolocation.ts          # Browser Geolocation wrapper + friendly messages
│   │   ├── uiError.ts              # WeatherApiError → UiError (title + message)
│   │   └── *.test.ts               # Unit tests for all lib modules
│   ├── test/
│   │   └── fixture.ts              # Deterministic 5-day VC response for tests
│   ├── App.tsx                     # State, fetch orchestration, bootstrap, search, refresh
│   ├── main.tsx                    # createRoot (no StrictMode — avoids double geolocation/API)
│   ├── styles.css                  # 1,900+ lines: themes, glassmorphism, layout, motion, a11y
│   ├── vite-env.d.ts
│   └── index.html
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json / .app.json / .node.json
├── vite.config.ts
└── README.md
```

## Theming

The root element receives a `data-theme` attribute derived from the current condition icon (`clear-day`, `rain-night`, `storm-day`, etc.). Each theme defines a custom radial gradient background, glow colours, and an accent colour — all CSS variables, no JS theme switching.

## Unit Conversions

The API is **always** called with `unitGroup=metric`. The app converts client-side for the °C/°F toggle — no re-fetch, instant switch.

| Metric | Imperial |
|--------|----------|
| °C     | °F       |
| km/h   | mph      |
| km     | mi       |
| hPa    | inHg     |
| mm     | in       |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Watch-mode tests |
| `npm run typecheck` | Type-check only (`tsc -b --noEmit`) |

## Visual Crossing API Notes

- **Endpoint**: `GET /VisualCrossingWebServices/rest/services/timeline/{location}/{start}/{end}`
- **Parameters used**: `unitGroup=metric`, `include=hours,current`, `contentType=json`
- **Date window**: ±2 days around today → guarantees 24 h history + 24 h forecast even at midnight/DST boundaries
- **Free tier**: 1,000 result rows/day (each hourly record = 1 row). A 5-day × 24 h request costs 120 rows.
- **CORS**: `access-control-allow-origin: *` — safe for client-only use.

## Deployment (GitHub Pages)

1. Push the `Weather Web App` folder to a repository (or use a subdirectory via `base`).
2. Add a repository secret `VITE_VISUAL_CROSSING_API_KEY` with your key.
3. Use a workflow like:

```yaml
name: Deploy to Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'Weather Web App/package-lock.json'
      - working-directory: Weather Web App
        run: |
          npm ci
          npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: Weather Web App/dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Because `vite.config.ts` sets `base: './'`, the built assets work at any sub-path (`https://user.github.io/repo/`).

## Accessibility

- Semantic HTML (`<header>`, `<main>`, `<section>`, `<ol>`, `<footer>`)
- ARIA labels on icon-only buttons
- `role="status"` / `aria-live="polite"` for loading/error announcements
- Focus-visible outlines (gold accent)
- Skip-to-content link
- Respects `prefers-reduced-motion` (all Framer Motion animations disable)

## License

MIT — do whatever you want, but keep the Visual Crossing attribution in the footer.

---

**Weather data by [Visual Crossing](https://www.visualcrossing.com/weather-api).**# skycast-weather-webapp
