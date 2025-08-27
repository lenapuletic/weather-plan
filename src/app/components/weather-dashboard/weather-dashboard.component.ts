import { Component, computed, inject } from '@angular/core';
import { WeatherStore } from '../../store/weather.store';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-weather-dashboard',
  imports: [DatePipe, DecimalPipe],
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
}
