import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WeatherStore } from '../../store/weather.store';
import {
  ACTIVITIES_BY_WEATHER_STATE,
  Activity,
  pickRandomActivities,
  SUGGESTED_ACTIVITY_COUNT,
} from '../../data/activity-suggestions.data';
import { ActivityInsightDialogComponent } from '../activity-insight-dialog/activity-insight-dialog.component';
import { WeatherData } from '../../interface/weather.interface';

@Component({
  selector: 'app-activity-suggestions',
  imports: [MatIconModule],
  templateUrl: './activity-suggestions.component.html',
  styleUrl: './activity-suggestions.component.scss',
})
export class ActivitySuggestionsComponent {
  readonly store = inject(WeatherStore);
  private readonly dialog = inject(MatDialog);

  private getWeatherState(temp: number, condition: string): string {
    const isRain = condition.includes('rain') || condition.includes('drizzle');
    const isSnow = condition.includes('snow');
    if (isRain) return 'rainy';
    if (isSnow) return 'snowy';
    if (temp >= 25) return 'hot';
    if (temp >= 15) return 'warm';
    if (temp >= 5) return 'cool';
    return 'cold';
  }

  readonly suggestedActivities = computed(() => {
    const weather = this.store.currentWeather();
    if (!weather) return [];

    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();
    const state = this.getWeatherState(temp, condition);
    const pool = ACTIVITIES_BY_WEATHER_STATE[state] || ACTIVITIES_BY_WEATHER_STATE['cool'];
    return pickRandomActivities(pool, SUGGESTED_ACTIVITY_COUNT);
  });

  openInsight(activity: Activity): void {
    const weather = this.store.currentWeather();
    if (!weather) return;

    this.dialog.open(ActivityInsightDialogComponent, {
      width: 'min(560px, 92vw)',
      maxWidth: '95vw',
      minHeight: 'min(440px, 72vh)',
      maxHeight: '90vh',
      panelClass: 'wp-activity-insight-dialog-shell',
      autoFocus: 'first-tabbable',
      data: {
        city: weather.name,
        country: weather.sys.country,
        activityTitle: activity.title,
        weatherSummary: this.buildWeatherSummary(weather),
      },
    });
  }

  private buildWeatherSummary(w: WeatherData): string {
    const main = w.weather[0];
    const parts = [
      `${Math.round(w.main.temp)}°C, feels like ${Math.round(w.main.feels_like)}°C`,
      main.description,
      `humidity ${w.main.humidity}%`,
      `wind ${w.wind.speed} m/s`,
    ];
    return parts.join(' · ');
  }
}
