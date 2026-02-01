import { Component, computed, inject } from '@angular/core';
import { WeatherStore } from '../../store/weather.store';
import { MatIconModule } from '@angular/material/icon';

type Activity = {
  icon: string,
  title: string
};

@Component({
  selector: 'app-activity-suggestions',
  imports: [MatIconModule],
  templateUrl: './activity-suggestions.component.html',
  styleUrl: './activity-suggestions.component.scss'
})
export class ActivitySuggestionsComponent {
  readonly store = inject(WeatherStore);
  private getWeatherState(temp: number, condition: string): string {
    const isRain = condition.includes('rain') || condition.includes('drizzle');
    const isSnow = condition.includes('snow');
    const isClear = condition.includes('clear') || condition.includes('sun');
    const isCloudy = condition.includes('cloud');

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

    const activitiesDB: Record<string, Activity[]> = {
      hot: [
        { icon: 'pool', title: 'Swimming' },
        { icon: 'icecream', title: 'Getting some ice cream' },
        { icon: 'beach_access', title: 'Heading to the beach' }
      ],
      warm: [
        { icon: 'directions_bike', title: 'Cycling' },
        { icon: 'park', title: 'Picnic in the park' },
        { icon: 'restaurant', title: 'Lunch on a terrace' }
      ],
      cool: [
        { icon: 'hiking', title: 'Going for a hike' },
        { icon: 'camera_alt', title: 'Urban photography' },
        { icon: 'run_circle', title: 'Running' }
      ],
      cold: [
        { icon: 'local_cafe', title: 'Visiting a cozy cafe' },
        { icon: 'museum', title: 'Visiting a museum' },
        { icon: 'book', title: 'Reading a book at home' }
      ],
      rainy: [
        { icon: 'movie', title: 'Movie marathon' },
        { icon: 'umbrella', title: 'Visiting an indoor mall' },
        { icon: 'sports_esports', title: 'Gaming session' }
      ],
      snowy: [
        { icon: 'ac_unit', title: 'Building a snowman' },
        { icon: 'downhill_skiing', title: 'Skiing' },
        { icon: 'fireplace', title: 'Enjoying hot chocolate' }
      ]
    };

    return activitiesDB[state] || activitiesDB['cool'];
  });
}