import { Component, computed, inject } from '@angular/core';
import { WeatherStore } from '../../store/weather.store';
import { DatePipe, DecimalPipe } from '@angular/common';
import { GeolocationData } from '../../interface/weather.interface';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-weather-dashboard',
  imports: [DatePipe, DecimalPipe, MatIconModule],
  templateUrl: './weather-dashboard.component.html',
  styleUrl: './weather-dashboard.component.scss'
})
export class WeatherDashboardComponent {
  readonly store = inject(WeatherStore);

  readonly currentWeather = this.store.currentWeather;
  readonly today = new Date();

  readonly weatherIconUrl = computed(() => {
    const iconCode = this.currentWeather()?.weather[0]?.icon;
    return iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : '';
  });

  readonly isSaved = computed(() => {
    const current = this.store.currentWeather();
    const saved = this.store.savedLocations();

    if (!current) return false;

    return saved.some(savedLocation => 
      savedLocation.name === current.name && savedLocation.country === current.sys.country
    );
  });

  onSaveLocation(event: MouseEvent) {
    event.stopPropagation();
    const weather = this.currentWeather();
    if (weather) {
      const selectedLocation: GeolocationData = {
        name: weather.name,
        country: weather.sys.country ?? 'N/A',
        lat: weather.coord.lat,
        lon: weather.coord.lon
      };
      if(this.isSaved()) {
        this.store.removeLocation(selectedLocation);
      } else {
        this.store.addLocation(selectedLocation);

      }
    }
  }
}
