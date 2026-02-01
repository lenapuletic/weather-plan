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
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  readonly weatherIconUrl = computed(() => {
    const iconCode = this.currentWeather()?.weather[0]?.icon;
    return iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : '';
  });

  onSaveLocation() {
    const weather = this.currentWeather();
    if (weather) {
      console.log(weather)
      const locationToSave: GeolocationData = {
        name: weather.name,
        country: weather.sys.country ?? 'N/A',
      };
      this.store.addLocation(locationToSave);
    }
  }
}
