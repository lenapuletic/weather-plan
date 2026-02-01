import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, filter, Observable, of, switchMap } from 'rxjs';
import { GeolocationData } from '../../interface/weather.interface';
import { WeatherService } from '../../services/weather.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-city-search',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe
  ],
  templateUrl: './city-search.component.html',
  styleUrl: './city-search.component.scss'
})
export class CitySearchComponent {
  @Output() search = new EventEmitter<GeolocationData>();

  private weatherService = inject(WeatherService);

  searchControl = new FormControl('');
  filteredCities$: Observable<GeolocationData[]>;

  constructor() {
    this.filteredCities$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(value => !!value),
      switchMap(value => 
        this.weatherService.getCitySuggestions(value!).pipe(
          catchError(err => {
            console.error('Search Error:', err);
            return of([]);
          })
        )
      )
    );
  }
  
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const city: GeolocationData = event.option.value;
    this.search.emit(city); 
  }
  displayFn(city: GeolocationData): string {
    return city && city.name ? `${city.name}, ${city.country}` : '';
  }
}
