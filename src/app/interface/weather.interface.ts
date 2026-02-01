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
      main: string;
      description: string;
      icon: string;
    }[];
    sys: {
        country: string;
        id: number;
    };
    coord: {
      lon: number,
      lat: number
    }
}

export interface GeolocationData {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
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