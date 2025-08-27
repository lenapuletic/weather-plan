import { Component, inject } from '@angular/core';
import { CitySearchComponent } from './components/city-search/city-search.component';
import { WeatherDashboardComponent } from './components/weather-dashboard/weather-dashboard.component';
import { ActivitySuggestionsComponent } from './components/activity-suggestions/activity-suggestions.component';
import { SavedLocationsComponent } from './components/saved-locations/saved-locations.component';
import { ForecastComponent } from './components/forecast/forecast.component';
import { WeatherStore } from './store/weather.store';

@Component({
  selector: 'app-root',
  imports: [
    CitySearchComponent,
    WeatherDashboardComponent,
    ActivitySuggestionsComponent,
    SavedLocationsComponent,
    ForecastComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly store = inject(WeatherStore);

  onCitySearch(city: string) {
    this.store.loadCurrentWeather(city);
  }
}
