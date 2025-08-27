import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { GeolocationData } from '../interface/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);

  getCitySuggestions(query: string): Observable<GeolocationData[]> {
    const options = {
      params: new HttpParams()
        .set('q', query)
        .set('limit', 5) // We only need the top 5 suggestions
        .set('appid', environment.openWeather.key)
    };

    const url = `https://api.openweathermap.org/geo/1.0/direct`;
    return this.http.get<GeolocationData[]>(url, options);
  }
  
  // This method will fetch the current weather for a given city
  getCurrentWeather(city: string) {
    const options = {
      params: new HttpParams()
        .set('q', city)
        .set('appid', environment.openWeather.key)
        .set('units', 'metric') // To get temperature in Celsius
    };
    
    const url = `${environment.openWeather.url}/weather`;
    return this.http.get(url, options);
  }
}
