# WeatherPlan 🌦️

![Angular](https://img.shields.io/badge/Angular-19-dd0031?style=flat&logo=angular)
![SignalStore](https://img.shields.io/badge/NgRx-SignalStore-purple?style=flat&logo=ngrx)
![RxJS](https://img.shields.io/badge/RxJS-Stream%20Management-B7178C?style=flat&logo=reactivex)
![Status](https://img.shields.io/badge/Layout-Responsive-blue)

### [🚀 Click to View Live Demo](https://lenapuletic.github.io/weather-plan/)

A reactive weather dashboard built with **Angular 19**, designed to demonstrate modern state management patterns using a hybrid of **Signals** and **RxJS**.

The application goes beyond basic API calls by implementing robust error handling, local state persistence, and intelligent data transformation to provide activity suggestions based on real-time weather conditions. **Activity insight dialogs** use the **Google Gemini API** to generate short local tips when you tap a suggestion, with a Google Search fallback.

Architecture: Angular frontend (GitHub Pages) + Node API proxy (Render). Gemini and OpenWeather keys stay server-side in proxy mode.

![Application Screenshot](application-ui.png)

## 🚀 Key Features

- **Smart Search:** Real-time city search with autocomplete powered by the OpenWeather geocoding API.
- **Reactive Dashboard:** Displays current weather, 5-day forecast, and environmental details (humidity, pressure, wind).
- **Activity suggestions:** Six curated activities per weather profile; the UI shows **four at a time**, chosen at random whenever the current weather updates so the list feels fresh.
- **AI-generated activity insights (optional):** Select an activity to open a dialog with **Gemini**-generated tips for that city and activity (plus weather context). Gemini is called through a **small Node proxy** in production so the API key is not bundled into `main-*.js`. If the proxy is not configured or the model is rate-limited, the dialog still offers **Search on Google** and a clear message.
- **Local Persistence:** Users can "bookmark" locations, which are saved to LocalStorage and persist between sessions.
- **Responsive layout:** The UI adapts from large desktops down to narrow phones (flexible header, stacked dashboard and forecast, tuned spacing and typography).

## 🛠️ Technical Highlights

This project focuses on architectural best practices for modern Angular applications:

- **SignalStore Architecture:** leveraged `signalStore` with custom features (`withMethods`, `withHooks`) to manage global state (loading, error, data) in a clean, reactive way without the boilerplate of Redux.
- **Signals & RxJS Interop:** Uses **Signals** for synchronous UI rendering while leveraging **RxJS** for asynchronous streams (for example city search with `distinctUntilChanged` and `switchMap`).
- **Stream Safety:** Uses the `catchError` operator inside `switchMap` to prevent "Stream Death," ensuring the search observable stays alive even after API failures (404s).
- **Performance & UX:**
  - **Autocomplete pipeline:** Ignores duplicate consecutive queries and cancels in-flight geocoding requests when the user types again (`switchMap`).
  - **TrackBy Optimization:** Uses stable keys (`activity.title`, forecast date strings) in `@for` loops to minimize DOM re-rendering.
- **Error Handling:** Graceful UI recovery for network errors or invalid cities, preventing the application from crashing.

## 📱 Responsive design

The layout is built with **CSS breakpoints** so the same app works on wide monitors and small touch screens. On smaller viewports the header compacts (title, search, and saved locations stay usable), the weather dashboard and activity suggestions **stack vertically**, and the forecast section reflows instead of forcing horizontal scrolling. Breakpoints are tuned around **~600–900px** so tablets and phones get a readable, single-column flow without a separate mobile-only build.

## 🏃‍♂️ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-plan.git
   cd weather-plan
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment files**

   For full functionality without client-side API keys, run/deploy the API proxy and set both `gemini.proxyBaseUrl` and `openWeather.proxyBaseUrl`.

   - **OpenWeather:** [`src/environments/environment.secrets.ts`](src/environments/environment.secrets.ts) is a committed stub; production builds overwrite it via `scripts/generate-secrets.mjs`.
     - For local direct calls (no proxy), run:

     ```bash
     OPENWEATHER_API_KEY=your_key node scripts/generate-secrets.mjs
     ```

     - Or edit `environment.secrets.ts` by hand (see [`environment.secrets.example.ts`](src/environments/environment.secrets.example.ts)).
     - For local proxy calls, set `openWeather.proxyBaseUrl` in [`src/environments/environment.ts`](src/environments/environment.ts) to `http://localhost:8787` and run `npm run api-proxy` with `OPENWEATHER_API_KEY`.

   - **Gemini (optional):** the **Gemini API key must not** be baked into GitHub Pages builds. Use the proxy (below). For local development you can either:
     - Run the proxy and point the app at it (recommended):

       ```bash
       GEMINI_API_KEY=your_gemini_key OPENWEATHER_API_KEY=your_openweather_key ALLOW_ORIGINS=http://localhost:4200 npm run api-proxy
       ```

       Then in [`src/environments/environment.ts`](src/environments/environment.ts) set both `gemini.proxyBaseUrl` and `openWeather.proxyBaseUrl` to `http://localhost:8787` (and leave `gemini.apiKey` empty).

     - **Or** set `gemini.apiKey` in `environment.ts` for direct browser calls (fine on localhost only; never commit a production build with a real key in the client).

   - Get an OpenWeather key at [OpenWeather](https://openweathermap.org/api).
   - Create a Gemini key in [Google AI Studio](https://aistudio.google.com/apikey) and use it **only** in the proxy’s `GEMINI_API_KEY` (or in local `environment.ts` for direct dev). You can pin a model with `gemini.model` in [`environment.ts`](src/environments/environment.ts) / [`environment.prod.ts`](src/environments/environment.prod.ts).

   **`npm start`** runs `node scripts/generate-secrets.mjs --allow-missing` first: if `OPENWEATHER_API_KEY` is set in your shell, `environment.secrets.ts` is refreshed; if not, your existing `environment.secrets.ts` is left unchanged so local keys are not wiped.

   **If an API key was ever committed or scanned from a public bundle**, rotate it in the provider dashboard.

4. **Run the application**

   ```bash
   npm start
   ```

   Then open `http://localhost:4200/`.

### API proxy (production / GitHub Pages)

The static app on GitHub Pages cannot hold a secret. [`server/api-proxy.mjs`](server/api-proxy.mjs) keeps both keys on the server and forwards:
- `POST /v1beta/models/{model}:generateContent` to Gemini
- `GET /openweather/geo/1.0/direct`, `GET /openweather/data/2.5/weather`, `GET /openweather/data/2.5/forecast` to OpenWeather

1. Deploy the proxy to a host that runs Node (for example [Render](https://render.com): New Web Service from this repo, start command `node server/api-proxy.mjs`, see optional [`render.yaml`](render.yaml)). Set environment variables:
   - **`GEMINI_API_KEY`** — your new Gemini key (after rotating any leaked key).
   - **`OPENWEATHER_API_KEY`** — your new OpenWeather key.
   - **`ALLOW_ORIGINS`** — comma-separated list of browser origins allowed to call the proxy, for example `http://localhost:4200,https://YOUR_USERNAME.github.io` (no path; GitHub Pages origin is `https://YOUR_USERNAME.github.io`).

2. In [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts), set both `gemini.proxyBaseUrl` and `openWeather.proxyBaseUrl` to the **HTTPS** origin of the deployed proxy (no trailing slash), for example `https://weather-plan-proxy.onrender.com`.

3. Run `npm run build:gh-pages` / `npm run deploy` as usual. The client bundle will **not** contain the Gemini key.

**Note:** The proxy URL is public; anyone can call it from an allowed origin. Keep `ALLOW_ORIGINS` tight and monitor usage in Google Cloud.

### Production build and deploy

`npm run build`, `npm run build:gh-pages`, and `npm run deploy` now use `scripts/generate-secrets.mjs --allow-missing`, so production builds work even when no local OpenWeather key is present (recommended when using the proxy for both APIs).

```bash
npm run build
npm run build:gh-pages
npm run deploy
```

If you still want direct local OpenWeather calls without proxy, generate `environment.secrets.ts` first:

```bash
OPENWEATHER_API_KEY=your_key node scripts/generate-secrets.mjs
```

In GitHub Actions (or any CI), no client API keys are required for production bundles when both `gemini.proxyBaseUrl` and `openWeather.proxyBaseUrl` point at your deployed API proxy.
