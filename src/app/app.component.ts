import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { CitySearchComponent } from './components/city-search/city-search.component';
import { WeatherDashboardComponent } from './components/weather-dashboard/weather-dashboard.component';
import { ActivitySuggestionsComponent } from './components/activity-suggestions/activity-suggestions.component';
import { SavedLocationsComponent } from './components/saved-locations/saved-locations.component';
import { ForecastComponent } from './components/forecast/forecast.component';
import { WeatherStore } from './store/weather.store';
import { MatIconModule } from '@angular/material/icon';
import { GeolocationData } from './interface/weather.interface';

@Component({
  selector: 'app-root',
  imports: [
    CitySearchComponent,
    WeatherDashboardComponent,
    ActivitySuggestionsComponent,
    SavedLocationsComponent,
    ForecastComponent,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly store = inject(WeatherStore);
  private eRef = inject(ElementRef);
  
  @ViewChild('sidebar') sidebarElement?: ElementRef;
  
  @ViewChild('menuBtn') menuBtn?: ElementRef;

  readonly currentWeather = this.store.currentWeather;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  showSavedLocations = false;

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this.showSavedLocations || !this.sidebarElement) return;

    const clickedInsideSidebar = this.sidebarElement.nativeElement.contains(event.target);
    const clickedBtn = this.menuBtn?.nativeElement.contains(event.target);

    if (!clickedInsideSidebar && !clickedBtn) {
      this.showSavedLocations = false;
    }
  }

  onCitySearch(city: GeolocationData) {
    this.store.loadCurrentWeather(city);
    this.store.loadForecast(city);
  }

  toggleSavedLocations(event: Event) {
    this.showSavedLocations = !this.showSavedLocations;  }
}
