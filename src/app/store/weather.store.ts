import { patchState, signalStore, withState, withMethods, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ForecastData, GeolocationData, WeatherData } from '../interface/weather.interface';
import { effect, inject } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';

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
      loadCurrentWeather: rxMethod<GeolocationData>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((city) => 
            weatherService.getCurrentWeather(city.name, city.country, city.lat, city.lon).pipe(
              tap((data) => patchState(store, { currentWeather: data, isLoading: false })),
              catchError((err) => {
                patchState(store, { 
                  error: `It seems that we don't have any data for this city. Please search for another one.`, 
                  isLoading: false 
                });
                return EMPTY;
              })
            )
          )
        )
      ),
      loadForecast: rxMethod<GeolocationData>(
        pipe(
          switchMap((city) =>
            weatherService.getForecast(city.name, city.country, city.lat, city.lon).pipe(
              tap((data) => patchState(store, { forecast: data })),
              catchError((err) => {
                return EMPTY; 
              })
            )
          )
        )
      ),
      addLocation(newLocation: GeolocationData) {
        const currentSaved = store.savedLocations();
        const exists = currentSaved.some(savedLocation => 
          savedLocation.name === newLocation.name && savedLocation.country === newLocation.country
        );

        if (!exists) {
          const updated = [...currentSaved, newLocation];
          patchState(store, { savedLocations: updated });
        }
      },
      removeLocation(location: GeolocationData) {
        const updated = store.savedLocations().filter(l => 
          l.name !== location.name || l.country !== location.country
        );
        patchState(store, { savedLocations: updated });
      }
    })
  ),
  withHooks({
    onInit(store) {
      const saved = localStorage.getItem('savedLocations');
      if (saved) {
        patchState(store, { savedLocations: JSON.parse(saved) });
      }

      effect(() => {
        const locations = store.savedLocations();
        localStorage.setItem('savedLocations', JSON.stringify(locations));
      });
    }
  })
);