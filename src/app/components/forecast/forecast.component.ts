import { Component, computed, inject } from '@angular/core';
import { WeatherStore } from '../../store/weather.store';
import { DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.scss'
})
export class ForecastComponent {
  readonly store = inject(WeatherStore);

  readonly dailyForecast = computed(() => {
    const forecastList = this.store.forecast()?.list;
    if (!forecastList) return [];

    return forecastList.filter(item => item.dt_txt.includes('12:00:00'));
  });

  getIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}
