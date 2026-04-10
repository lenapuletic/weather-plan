# WeatherPlan 🌦️

![Angular](https://img.shields.io/badge/Angular-19-dd0031?style=flat&logo=angular)
![SignalStore](https://img.shields.io/badge/NgRx-SignalStore-purple?style=flat&logo=ngrx)
![RxJS](https://img.shields.io/badge/RxJS-Stream%20Management-B7178C?style=flat&logo=reactivex)
![Status](https://img.shields.io/badge/Layout-Responsive-blue)

### [🚀 Click to View Live Demo](https://lenapuletic.github.io/weather-plan/)

A reactive weather dashboard built with **Angular 19**, designed to demonstrate modern state management patterns using a hybrid of **Signals** and **RxJS**.

The application goes beyond basic API calls by implementing robust error handling, local state persistence, and intelligent data transformation to provide activity suggestions based on real-time weather conditions.

![Application Screenshot](application-ui.png)

## 🚀 Key Features

- **Smart Search:** Real-time city search with debouncing and autocomplete.
- **Reactive Dashboard:** Displays current weather, 5-day forecast, and environmental details (humidity, pressure, wind).
- **Activity Engine:** Suggests real-world activities (e.g., "Perfect for visiting a museum") based on temperature and weather codes.
- **Local Persistence:** Users can "bookmark" locations, which are saved to LocalStorage and persist between sessions.
- **Responsive layout:** The UI adapts from large desktops down to narrow phones (flexible header, stacked dashboard and forecast, tuned spacing and typography).

## 🛠️ Technical Highlights

This project focuses on architectural best practices for modern Angular applications:

- **SignalStore Architecture:** leveraged `signalStore` with custom features (`withMethods`, `withHooks`) to manage global state (loading, error, data) in a clean, reactive way without the boilerplate of Redux.
- **Signals & RxJS Interop:** Uses **Signals** for synchronous UI rendering while leveraging **RxJS** for complex asynchronous event streams (search input handling).
- **Stream Safety:** Implements the `catchError` operator inside `switchMap` to prevent "Stream Death," ensuring the search observable stays alive even after API failures (404s).
- **Performance:**
  - **Debouncing:** Rate-limits API requests to prevent flooding the server.
  - **OnPush Strategy:** Optimized change detection cycles.
  - **TrackBy Optimization:** Uses unique keys (`$index` and `date` strings) in `@for` loops to minimize DOM re-rendering.
- **Error Handling:** Graceful UI recovery for network errors or invalid cities, preventing the application from crashing.

## 📱 Responsive design

The layout is built with **CSS breakpoints** so the same app works on wide monitors and small touch screens. On smaller viewports the header compacts (title, search, and saved locations stay usable), the weather dashboard and activity suggestions **stack vertically**, and the forecast section reflows instead of forcing horizontal scrolling. Breakpoints are tuned around **~600–900px** so tablets and phones get a readable, single-column flow without a separate mobile-only build.

## 🏃‍♂️ Getting Started

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/YOUR_USERNAME/weather-plan.git](https://github.com/YOUR_USERNAME/weather-plan.git)
    cd weather-plan
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **OpenWeather API key (local development)**

    Production builds do **not** store the API key in git. For local `ng serve`, create your own key file:

    ```bash
    cp src/environments/environment.example.ts src/environments/environment.ts
    ```

    Edit `src/environments/environment.ts` and set `openWeather.key` to your key from [OpenWeather](https://openweathermap.org/api).

    **If an API key was ever committed to this repository**, rotate it in the OpenWeather dashboard and use the new key only in `environment.ts` (local) or in CI as `OPENWEATHER_API_KEY`.

4.  **Run the application**
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200/`.

### Production build and deploy

`npm run build` and `npm run deploy` require the key at build time via the environment variable `OPENWEATHER_API_KEY`. The build runs `scripts/generate-secrets.mjs`, which overwrites the committed stub `src/environments/environment.secrets.ts` before `ng build`. After a **local** production build, discard changes to that file if it now contains your key (do not commit real keys).

```bash
OPENWEATHER_API_KEY=your_key npm run build
```

In GitHub Actions (or any CI), add `OPENWEATHER_API_KEY` as a secret and run `npm run build` (or `npm run deploy`) so the script can refresh `environment.secrets.ts` before `ng build`.

If you run `ng build` or `ng deploy` directly without `npm run` scripts, run `node scripts/generate-secrets.mjs` first with `OPENWEATHER_API_KEY` set, or temporarily edit `src/environments/environment.secrets.ts` locally (do not commit the real key).
