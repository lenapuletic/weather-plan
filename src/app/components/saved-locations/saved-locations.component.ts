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
    this.store.loadCurrentWeather(location);
    this.store.loadForecast(location);
  }

  onRemoveLocation(event: MouseEvent, location: GeolocationData) {
    event.stopPropagation();
    this.store.removeLocation(location);
  }
}
