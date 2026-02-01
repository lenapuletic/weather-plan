import { Component, ElementRef, EventEmitter, HostListener, inject, Output, ViewChild } from '@angular/core';
import { CitySearchComponent } from './components/city-search/city-search.component';
import { WeatherDashboardComponent } from './components/weather-dashboard/weather-dashboard.component';
import { ActivitySuggestionsComponent } from './components/activity-suggestions/activity-suggestions.component';
import { SavedLocationsComponent } from './components/saved-locations/saved-locations.component';
import { ForecastComponent } from './components/forecast/forecast.component';
import { WeatherStore } from './store/weather.store';
import { MatIconModule } from '@angular/material/icon';

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
  
  // Grab the specific sidebar element from the template
  @ViewChild('sidebar') sidebarElement?: ElementRef;
  
  // Also grab the button so we don't close when clicking the trigger
  @ViewChild('menuBtn') menuBtn?: ElementRef;

  showSavedLocations = false;

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this.showSavedLocations || !this.sidebarElement) return;

    const clickedInsideSidebar = this.sidebarElement.nativeElement.contains(event.target);
    const clickedBtn = this.menuBtn?.nativeElement.contains(event.target);

    // If the click was NOT in the sidebar AND NOT on the toggle button
    if (!clickedInsideSidebar && !clickedBtn) {
      this.showSavedLocations = false;
    }
  }

  onCitySearch(city: string) {
    this.store.loadCurrentWeather(city);
    this.store.loadForecast(city);
  }

  toggleSavedLocations(event: Event) {
    //event.stopPropagation();
    this.showSavedLocations = !this.showSavedLocations;  }
}
