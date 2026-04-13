/**
 * Copy this file to `environment.ts` for local development (that file is gitignored).
 * API keys live in `environment.secrets.ts`: run `OPENWEATHER_API_KEY=... node scripts/generate-secrets.mjs`
 * or edit that file locally (see `environment.secrets.example.ts`).
 */
import { geminiApiKey, openWeatherApiKey } from './environment.secrets';

export const environment = {
  production: false,
  openWeather: {
    key: openWeatherApiKey,
    url: 'https://api.openweathermap.org/data/2.5',
  },
  gemini: {
    apiKey: geminiApiKey,
    model: '' as string | undefined,
  },
};
