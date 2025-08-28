export interface WeatherData {
    name: string; // City name
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
}

export interface GeolocationData {
    name: string;
    country: string;
    state?: string;
}

export interface ForecastData {
    list: {
      dt_txt: string;
      main: {
        temp: number;
        temp_min: number;
        temp_max: number;
      };
      weather: {
        icon: string;
        description: string;
      }[];
    }[];
}