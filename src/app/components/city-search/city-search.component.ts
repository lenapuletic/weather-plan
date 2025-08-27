import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
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
  @Output() search = new EventEmitter<string>();

  private weatherService = inject(WeatherService);


  searchControl = new FormControl('');
  cities = ['New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Belgrade', 'Berlin']; // ToDo: add all cities available in the api
  filteredCities: string[] = [];
  filteredCities$: Observable<GeolocationData[]>;

  constructor() {
    this.filteredCities$ = this.searchControl.valueChanges.pipe(
      // Wait for 300ms after the user stops typing
      debounceTime(300),
      // Only proceed if the text has actually changed
      distinctUntilChanged(),
      // Only make an API call if the search term is 2+ characters long
      filter(value => (value?.length ?? 0) >= 2),
      // Switch to our new API call
      switchMap(value => this.weatherService.getCitySuggestions(value!))
    );
    
    // this.searchControl.valueChanges.subscribe(value => {
    //   this.filteredCities = this.filterByInput(value || '');
    // });
  }

  displayFn(city: GeolocationData): string {
    console.log(city)
    return city && city.name ? `${city.name}, ${city.country}` : '';
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const city: GeolocationData = event.option.value;
    this.search.emit(city.name);
  }

  private filterByInput(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => city.toLowerCase().includes(filterValue));
  }

  onSearch() {
    const city = this.searchControl.value?.trim();
    if (city) {
      this.search.emit(city);
    }
  }
}
