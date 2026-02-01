import { patchState, signalStore, withState, withMethods, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ForecastData, GeolocationData, WeatherData } from '../interface/weather.interface';
import { inject } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { pipe, switchMap, tap } from 'rxjs';

const getInitialSavedLocations = (): GeolocationData[] => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('savedLocations');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
};

export interface WeatherState {
  currentWeather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  forecast: ForecastData | null;
  savedLocations: GeolocationData[];
}

const initialState: WeatherState = {
  currentWeather: null,
  isLoading: false,
  error: null,
  forecast: null,
  savedLocations: [],
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
      addLocation(location: GeolocationData) {
        const updatedLocations = [...store.savedLocations(), location];
        patchState(store, { savedLocations: updatedLocations });
        localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      },
      removeLocation(location: GeolocationData) {
        const updatedLocations = store.savedLocations().filter(l => l.name !== location.name && l.country !== location.country);
        patchState(store, { savedLocations: updatedLocations });
        localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      },
    })
  ),
  withHooks({
    onInit(store) {
      patchState(store, { savedLocations: getInitialSavedLocations() });
    },
  })
);