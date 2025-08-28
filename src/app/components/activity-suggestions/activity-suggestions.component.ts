import { Component, computed, inject } from '@angular/core';
import { WeatherStore } from '../../store/weather.store';

type Activity = {
  name: string;
  description: string;
};

@Component({
  selector: 'app-activity-suggestions',
  imports: [],
  templateUrl: './activity-suggestions.component.html',
  styleUrl: './activity-suggestions.component.scss'
})
export class ActivitySuggestionsComponent {
  readonly store = inject(WeatherStore);
  private readonly currentWeather = this.store.currentWeather;

  readonly suggestedActivities = computed(() => {
    const weather = this.currentWeather();
    if (!weather) return [];

    const temp = weather.main.temp;
    const condition = weather.weather[0].description.toLowerCase();

    if (condition.includes('clear')) {
      if (temp > 20) return [{ name: 'Go for a hike', description: 'Enjoy the sunny weather outdoors.' }];
      return [{ name: 'Go for a walk', description: 'A perfect day for a stroll.' }];
    }
    if (condition.includes('clouds')) {
      return [{ name: 'Visit a museum', description: 'Explore some art and culture.' }];
    }
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return [{ name: 'Try a new cafe', description: 'A cozy spot to enjoy the day.' }];
    }
    if (condition.includes('snow')) {
      return [{ name: 'Build a snowman', description: 'Have some fun in the snow!' }];
    }

    return [{ name: 'Read a book', description: 'A good day to relax indoors.' }];
  });
}