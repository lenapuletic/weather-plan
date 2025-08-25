import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-city-search',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './city-search.component.html',
  styleUrl: './city-search.component.scss'
})
export class CitySearchComponent {
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('');
  cities = ['New York', 'Los Angeles', 'London', 'Paris', 'Tokyo', 'Belgrade', 'Berlin']; // ToDo: add all cities available in the api
  filteredCities: string[] = [];

  constructor() {
    this.searchControl.valueChanges.subscribe(value => {
      this.filteredCities = this.filterByInput(value || '');
    });
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
