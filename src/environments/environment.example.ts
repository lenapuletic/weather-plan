/**
 * Copy this file to `environment.ts` for local development (that file is gitignored).
 * Get a key at https://openweathermap.org/api
 */
export const environment = {
  production: false,
  openWeather: {
    key: 'OPENWEATHER_API_KEY',
    url: 'https://api.openweathermap.org/data/2.5',
  },
};
