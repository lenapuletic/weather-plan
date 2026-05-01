/**
 * Optional reference: the real module is `environment.secrets.ts` (committed stub).
 * Production builds overwrite it via `scripts/generate-secrets.mjs` + OPENWEATHER_API_KEY.
 * Gemini stays off the client in production — see README and server/gemini-proxy.mjs.
 */
export const openWeatherApiKey = 'YOUR_OPENWEATHER_API_KEY';
