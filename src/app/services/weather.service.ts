import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ForecastData, GeolocationData } from '../interface/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);

  getCitySuggestions(query: string): Observable<GeolocationData[]> {
    const options = {
      params: new HttpParams()
        .set('q', query)
        .set('limit', 5)
        .set('appid', environment.openWeather.key)
    };

    const url = `https://api.openweathermap.org/geo/1.0/direct`;
    return this.http.get<GeolocationData[]>(url, options);
  }
  
  getCurrentWeather(city: string) {
    const options = {
      params: new HttpParams()
        .set('q', city)
        .set('appid', environment.openWeather.key)
        .set('units', 'metric')
    };
    
    const url = `${environment.openWeather.url}/weather`;
    return this.http.get(url, options);
  }

  getForecast(city: string): Observable<ForecastData> {
    const options = {
      params: new HttpParams()
        .set('q', city)
        .set('appid', environment.openWeather.key)
        .set('units', 'metric')
    };
  
    const url = `${environment.openWeather.url}/forecast`;
    return this.http.get<ForecastData>(url, options);
  }
}
