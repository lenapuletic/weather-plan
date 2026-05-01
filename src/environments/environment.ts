/**
 * Local defaults (committed). Put OpenWeather / Gemini dev settings here; for production builds
 * this file is replaced by environment.prod.ts (see angular.json).
 *
 * Gemini: run `npm run gemini-proxy` with GEMINI_API_KEY and set `proxyBaseUrl` to
 * http://localhost:8787, or set `apiKey` for direct calls (localhost only).
 */
import { openWeatherApiKey } from './environment.secrets';

export const environment = {
  production: false,
  openWeather: {
    key: openWeatherApiKey,
    url: 'https://api.openweathermap.org/data/2.5',
  },
  gemini: {
    apiKey: '' as string,
    proxyBaseUrl: '' as string,
    model: '' as string | undefined,
  },
};
