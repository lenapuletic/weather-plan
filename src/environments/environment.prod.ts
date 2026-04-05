import { openWeatherApiKey } from './environment.secrets';

export const environment = {
  production: true,
  openWeather: {
    key: openWeatherApiKey,
    url: 'https://api.openweathermap.org/data/2.5',
  },
};
