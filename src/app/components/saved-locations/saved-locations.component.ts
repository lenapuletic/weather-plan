import { Component, inject, output } from '@angular/core';
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

  readonly locationSelected = output<void>();

  onLocationSelect(location: GeolocationData) {
    this.store.loadCurrentWeather(location);
    this.store.loadForecast(location);
    this.locationSelected.emit();
  }

  onRemoveLocation(event: MouseEvent, location: GeolocationData) {
    event.stopPropagation();
    this.store.removeLocation(location);
  }
}
