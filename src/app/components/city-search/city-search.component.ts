import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { GeolocationData } from '../../interface/weather.interface';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-city-search',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './city-search.component.html',
  styleUrl: './city-search.component.scss',
})
export class CitySearchComponent {
  @Output() search = new EventEmitter<GeolocationData>();
  @ViewChild('auto') autocomplete!: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger;

  private weatherService = inject(WeatherService);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('');
  isLoadingSuggestions = signal(false);
  hasActiveQuery = signal(false);
  suggestions = signal<GeolocationData[]>([]);
  suggestionError = signal<string | null>(null);

  private readonly isNonEmptyString = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0;

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((value) => {
          const hasQuery = this.isNonEmptyString(value);
          this.hasActiveQuery.set(hasQuery);
          this.suggestionError.set(null);
          if (!hasQuery) {
            this.isLoadingSuggestions.set(false);
            this.suggestions.set([]);
          }
        }),
        filter(this.isNonEmptyString),
        tap(() => this.isLoadingSuggestions.set(true)),
        switchMap((value) =>
          this.weatherService.getCitySuggestions(value).pipe(
            catchError((err) => {
              console.error('City suggestion request failed', err);
              this.suggestionError.set(this.getSuggestionErrorMessage(err));
              return of([] as GeolocationData[]);
            }),
            finalize(() => this.isLoadingSuggestions.set(false)),
          ),
        ),
        tap((cities) => this.suggestions.set(cities)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  onEnter(event: Event) {
    event.preventDefault();
    if (!this.autocomplete.isOpen || this.trigger.activeOption) return;
    const firstCity = this.suggestions()[0];
    if (firstCity) {
      this.search.emit(firstCity);
      this.searchControl.setValue(this.displayFn(firstCity), { emitEvent: false });
      this.trigger.closePanel();
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const city: GeolocationData = event.option.value;
    this.search.emit(city);
  }

  displayFn(city: GeolocationData): string {
    return city && city.name ? `${city.name}, ${city.country}` : '';
  }

  private getSuggestionErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Cannot reach the weather API. Run npm start (starts the local API proxy).';
      }
      if (err.status === 401 || err.status === 403) {
        return 'Weather API key is missing or invalid.';
      }
      if (err.status === 500) {
        const body = err.error as { error?: string } | undefined;
        if (body?.error === 'OPENWEATHER_API_KEY is not set') {
          return 'Set OPENWEATHER_API_KEY before starting the API proxy.';
        }
        return 'Weather API proxy is misconfigured.';
      }
    }

    return 'Could not load city suggestions.';
  }
}
