import { patchState, signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ForecastData, WeatherData } from '../interface/weather.interface';
import { inject } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { pipe, switchMap, tap } from 'rxjs';

export interface WeatherState {
  currentWeather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  forecast: ForecastData | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  isLoading: false,
  error: null,
  forecast: null
};

export const WeatherStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
        store,
        weatherService = inject(WeatherService)
    ) => ({
      loadCurrentWeather: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((city) =>
            weatherService.getCurrentWeather(city).pipe(
              tap({
                next: (data) => patchState(store, { currentWeather: data as WeatherData, isLoading: false }),
                error: (err) => {
                  console.error('API Error:', err);
                  patchState(store, { error: 'City not found', isLoading: false })
                },
              })
            )
          )
        )
      ),
      loadForecast: rxMethod<string>(
        pipe(
          switchMap((city) =>
            weatherService.getForecast(city).pipe(
              tap({
                next: (data) => patchState(store, { forecast: data }),
                error: (err) => console.error('Forecast API Error:', err),
              })
            )
          )
        )
      ),
    })
  )
);