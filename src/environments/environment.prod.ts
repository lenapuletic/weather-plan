export const environment = {
  production: true,
  openWeather: {
    /** Unused in production when using the proxy; keep empty so no key ships in the bundle. */
    key: '',
    url: 'https://api.openweathermap.org/data/2.5',
    /**
     * HTTPS origin of server/api-proxy.mjs (no trailing slash), e.g.
     * https://weather-plan-api-proxy.onrender.com
     */
    proxyBaseUrl: 'https://weather-plan-proxy.onrender.com',
  },
  gemini: {
    /** Unused in production when using the proxy; keep empty so no key ships in the bundle. */
    apiKey: '',
    /**
     * HTTPS origin of server/api-proxy.mjs (no trailing slash), e.g.
     * https://weather-plan-api-proxy.onrender.com
     * Leave empty to disable AI tips in the deployed app until the proxy is configured.
     */
    proxyBaseUrl: 'https://weather-plan-proxy.onrender.com',
    model: '' as string | undefined,
  },
};
