import { openWeatherApiKey } from './environment.secrets';

export const environment = {
  production: true,
  openWeather: {
    key: openWeatherApiKey,
    url: 'https://api.openweathermap.org/data/2.5',
  },
  gemini: {
    /** Unused in production when using the proxy; keep empty so no key ships in the bundle. */
    apiKey: '',
    /**
     * HTTPS origin of server/gemini-proxy.mjs (no trailing slash), e.g.
     * https://weather-plan-gemini-proxy.onrender.com
     * Leave empty to disable AI tips in the deployed app until the proxy is configured.
     */
    proxyBaseUrl: '',
    model: '' as string | undefined,
  },
};
