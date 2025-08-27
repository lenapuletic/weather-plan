import { patchState, signalStore, withState, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { WeatherData } from '../interface/weather.interface';
import { inject } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { pipe, switchMap, tap } from 'rxjs';

export interface WeatherState {
  currentWeather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  isLoading: false,
  error: null,
};

export const WeatherStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const weatherService = inject(WeatherService);

    return {
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
    };
  })
);