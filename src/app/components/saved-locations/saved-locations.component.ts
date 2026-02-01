import { Component, inject } from '@angular/core';
import { WeatherStore } from '../../store/weather.store';
import { GeolocationData } from '../../interface/weather.interface';

@Component({
  selector: 'app-saved-locations',
  imports: [],
  templateUrl: './saved-locations.component.html',
  styleUrl: './saved-locations.component.scss'
})
export class SavedLocationsComponent {
  readonly store = inject(WeatherStore);

  onLocationSelect(location: GeolocationData) {
    this.store.loadCurrentWeather(location.name);
    this.store.loadForecast(location.name);
  }

  onRemoveLocation(event: MouseEvent, location: GeolocationData) {
    event.stopPropagation(); // Prevent the location from being selected
    this.store.removeLocation(location);
  }
}
