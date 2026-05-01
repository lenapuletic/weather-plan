/**
 * Local defaults (committed). Put OpenWeather / Gemini dev settings here; for production builds
 * this file is replaced by environment.prod.ts (see angular.json).
 *
 * Proxy mode (recommended): run `npm run api-proxy` with GEMINI_API_KEY and
 * OPENWEATHER_API_KEY, then set both `gemini.proxyBaseUrl` and
 * `openWeather.proxyBaseUrl` to `http://localhost:8787`.
 * Gemini direct mode (localhost only): keep `gemini.proxyBaseUrl` empty and set `gemini.apiKey`.
 */
import { openWeatherApiKey } from './environment.secrets';

export const environment = {
  production: false,
  openWeather: {
    key: openWeatherApiKey,
    url: 'https://api.openweathermap.org/data/2.5',
    proxyBaseUrl: 'http://localhost:8787' as string,
  },
  gemini: {
    apiKey: '' as string,
    proxyBaseUrl: 'http://localhost:8787' as string,
    model: '' as string | undefined,
  },
};
