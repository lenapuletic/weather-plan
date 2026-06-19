import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ForecastData, GeolocationData, WeatherData } from '../interface/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private readonly openWeatherProxyBase = environment.openWeather.proxyBaseUrl?.trim();

  getCitySuggestions(query: string): Observable<GeolocationData[]> {
    const params = this.buildBaseParams().set('q', query).set('limit', 5);
    const url = this.proxyUrl('/openweather/geo/1.0/direct', 'https://api.openweathermap.org/geo/1.0/direct');
    return this.http.get<GeolocationData[]>(url, { params });
  }

  getCurrentWeather(city: string, country: string, lat: number, lon: number) {
    const params = this.buildBaseParams()
      .set('q', `${city.replace(/^City of /, '').replace(/ City$/, '')},${country}`)
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', 'metric');
    const url = this.proxyUrl('/openweather/data/2.5/weather', `${environment.openWeather.url}/weather`);
    return this.http.get<WeatherData>(url, { params });
  }

  getForecast(city: string, country: string, lat: number, lon: number) {
    const params = this.buildBaseParams()
      .set('q', `${city.replace(/^City of /, '').replace(/ City$/, '')},${country}`)
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', 'metric');
    const url = this.proxyUrl('/openweather/data/2.5/forecast', `${environment.openWeather.url}/forecast`);
    return this.http.get<ForecastData>(url, { params });
  }

  private proxyUrl(proxyPath: string, directUrl: string): string {
    return this.openWeatherProxyBase
      ? `${this.openWeatherProxyBase.replace(/\/$/, '')}${proxyPath}`
      : directUrl;
  }

  private buildBaseParams(): HttpParams {
    const params = new HttpParams();
    if (this.openWeatherProxyBase) {
      return params;
    }
    return params.set('appid', environment.openWeather.key);
  }
}
